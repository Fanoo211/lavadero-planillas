<template>
  <div>
    <!-- Navbar -->
    <NavbarComp :title="'Lavadero de Bandejas'" @logout="logout" />

    <!-- Main -->
    <div class="container-fluid mt-4">
      <div class="row justify-content-center align-items-center">
        <div class="col-12 text-center">
          <h2 class="welcome-message animated-welcome">
            Bienvenido, {{ userStore.name }} {{ userStore.surname }}
          </h2>
        </div>

        <!-- Botón de nueva planilla -->
        <div v-if="!userStore.isAdmin" class="col-md-4 col-sm-6 col-12">
          <div class="card text-center shadow new-planilla-btn" @click="nuevaPlanilla">
            <div class="card-body">
              <h3 class="card-title">+</h3>
              <p class="card-text">Nueva Planilla</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="text-center mt-5">
        <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando planillas, por favor espere...</p>
      </div>

      <!-- Historial de Planillas -->
      <div v-else class="mt-4">
        <div class="row align-items-center mb-3">
          <div class="col-12 col-md-4 text-start text-md-start">
            <!-- Espacio a la izquierda -->
          </div>

          <div class="col-12 col-md-4 text-center">
            <h3 class="historial-title m-0">
              Historial de Planillas
              <span v-if="userStore.isAdmin">(Todos los usuarios)</span>
            </h3>
          </div>

          <!-- Botón de Filtrar por Fecha -->
          <div class="col-12 col-md-4 d-flex justify-content-end align-items-center mt-2 mt-md-0 gap-2">
            <Datepicker
              v-model="filtroFecha"
              locale="es"
              :enable-time-picker="false"
              :clearable="false"
              class="w-50" 
              :placeholder="'Filtrar por fecha'"
            />
            <button
              v-if="filtroFecha"
              class="btn btn-outline-danger btn-sm"
              @click="filtroFecha = null"
            >
              ❌
            </button>
          </div>
        </div>

        <div v-for="(fila, index) in planillasAgrupadas" :key="index" class="row justify-content-center">
          <div v-for="planilla in fila" :key="planilla.id" class="col-md-4 col-sm-6 col-12 mb-4">
            <CardPlanilla
              :planilla="planilla"
              @click="abrirModal(planilla)"
              class="shadow-sm"
            />
          </div>
        </div>
      </div>

      <div v-if="planillasAgrupadas.length === 0 && !cargando" class="text-center text-muted mt-4">
        <p>No se encontraron planillas para la fecha seleccionada.</p>
      </div>

      <!-- Botón para mostrar más planillas -->
      <div class="row justify-content-center mb-4">
        <div class="col-auto">
          <button
            v-if="!filtroFecha && !todasPlanillasCargadas && !cargando"
            class="btn btn-primary btn-lg px-4"
            @click="cargarMasPlanillas"
          >
            Mostrar más planillas
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ModalPlanilla
      v-if="modalVisible"
      :planilla="planillaSeleccionada"
      :isAdmin="userStore.isAdmin"
      @close="cerrarModal"
      @planillaEliminada="eliminarPlanillaLocal"
    />
  </div>

</template>

<script>
import { es } from 'date-fns/locale';
import NavbarComp from "@/components/NavbarComp.vue";
import CardPlanilla from "@/components/CardPlanilla.vue";
import ModalPlanilla from "@/components/ModalPlanilla.vue";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/user";
import { getFirestore, collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { ref } from "vue";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';


const db = getFirestore();

export default {
  name: "HomeView",
  components: {
    NavbarComp,
    CardPlanilla,
    ModalPlanilla,
    Datepicker,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const logout = async () => {
      await signOut(auth);
      router.push("/");
    };

    const nuevaPlanilla = () => {
      router.push("/nueva-planilla");
    };

    const inputFecha = ref(null);

    return { logout, nuevaPlanilla, userStore, inputFecha };
  },
  data() {
    return {
      planillas: [],
      cargando: true, 
      todasPlanillasCargadas: false,
      ultimaVisible: null,
      planillasPorPagina: 6,
      modalVisible: false,
      planillaSeleccionada: null,
      filtroFecha: null,
      filtroPlanillas: [],
      mostrarDatepicker: false,
      localeEs: es,
    };
  },
  computed: {
    planillasAgrupadas() {
      const fuente = this.filtroFecha ? this.filtroPlanillas : this.planillas;
      const chunkSize = 3;
      let result = [];
      for (let i = 0; i < fuente.length; i += chunkSize) {
        result.push(fuente.slice(i, i + chunkSize));
      }
      return result;
    }
  },
  watch: {
    filtroFecha(nuevaFecha) {
      if (nuevaFecha) {
        this.cargarPlanillasPorFecha();
      } else {
        this.filtroPlanillas = [];
      }
    }
  },
  async created() {
    await this.cargarPlanillas();
  },
  methods: {
    async cargarPlanillas() {
      this.cargando = true;
      const user = auth.currentUser;

      if (user) {
        try {
          let planillasQuery;

          if (this.userStore.isAdmin) {
            planillasQuery = query(
              collection(db, "planillas"),
              orderBy("fecha", "desc"), // Ordenar por la fecha ingresada en la planilla
              limit(this.planillasPorPagina)
            );
          } else {
            planillasQuery = query(
              collection(db, "planillas"),
              where("usuario.email", "==", user.email),
              orderBy("fecha", "desc"), // Ordenar por la fecha ingresada en la planilla
              limit(this.planillasPorPagina)
            );
          }

          if (this.ultimaVisible) {
            planillasQuery = query(planillasQuery, startAfter(this.ultimaVisible));
          }

          const querySnapshot = await getDocs(planillasQuery);
          let planillas = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Si es admin, obtener nombres de usuario desde la colección de usuarios
          if (this.userStore.isAdmin) {
            const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
            const usuarios = usuariosSnapshot.docs.reduce((acc, doc) => {
              const data = doc.data();
              acc[data.email] = `${data.name || "N/A"} ${data.surname || ""}`;
              return acc;
            }, {});

            // Agregar nombres de usuario a las planillas
            planillas = planillas.map((planilla) => ({
              ...planilla,
              usuarioNombre: usuarios[planilla.usuario.email] || "Desconocido",
            }));
          }

          this.planillas = [...this.planillas, ...planillas];
          this.ultimaVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

          if (querySnapshot.docs.length < this.planillasPorPagina) {
            this.todasPlanillasCargadas = true;
          }
        } catch (error) {
          console.error("Error al obtener las planillas:", error);
        }finally{
          this.cargando = false;
        }
      }
    },
    cargarMasPlanillas() {
      this.cargarPlanillas();
    },
    abrirModal(planilla) {
      this.planillaSeleccionada = planilla;
      this.modalVisible = true;
    },
    cerrarModal() {
      this.planillaSeleccionada = null;
      this.modalVisible = false;
    },
    eliminarPlanillaLocal(id) {
      this.planillas = this.planillas.filter(planilla => planilla.id !== id);
    },
    async cargarPlanillasPorFecha() {
      this.cargando = true;
      this.filtroPlanillas = [];

      try {
        const user = auth.currentUser;
        let planillasQuery;

        if (this.userStore.isAdmin) {
          planillasQuery = query(collection(db, "planillas"));
        } else {
          planillasQuery = query(
            collection(db, "planillas"),
            where("usuario.email", "==", user.email)
          );
        }

        const snapshot = await getDocs(planillasQuery);
        let planillas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        if (this.userStore.isAdmin) {
          const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
          const usuarios = usuariosSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc[data.email] = `${data.name || "N/A"} ${data.surname || ""}`;
            return acc;
          }, {});

          planillas = planillas.map(planilla => ({
            ...planilla,
            usuarioNombre: usuarios[planilla.usuario.email] || "Desconocido"
          }));
        }

        // Filtrar por la fecha seleccionada (formato exacto)
        const formatearFecha = (fecha) => {
          const date = new Date(fecha.seconds ? fecha.seconds * 1000 : fecha); // si es Timestamp
          return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
        };

        const fechaFiltroFormateada = formatearFecha(this.filtroFecha);

        this.filtroPlanillas = planillas
          .filter(p => formatearFecha(p.fecha) === fechaFiltroFormateada)
          .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
          .slice(0, this.planillasPorPagina);

        this.cargando = false;
      } catch (error) {
        console.error("Error al cargar planillas por fecha:", error);
        this.cargando = false;
      }
    },
  }
};
</script>

<style scoped>
/* Contenedor general */
.container-fluid {
  padding-left: 5%;
  padding-right: 5%;
}

/* Mensaje de bienvenida */
.welcome-message {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* Spinner de carga */
.spinner-border {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Estilo del título */
.historial-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

/* Estilo de las tarjetas de historial */
.card {
  border-radius: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Botón de Nueva Planilla */
.new-planilla-btn {
  background-color: #007bff;
  color: white;
  border-radius: 15px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.new-planilla-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 123, 255, 0.5);
}

.new-planilla-btn:active {
  transform: translateY(1px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}

/* Botón de mostrar más */
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  font-size: 18px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated-welcome {
  animation: fadeInUp 1s ease-in-out;
}
</style>
