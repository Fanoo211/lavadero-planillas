<template>
  <div>
    <!-- Navbar -->
    <NavbarComp :title="'Lavadero de Bandejas'" @logout="logout" />

    <!-- Main -->
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-12 text-center">
          <h2 class="welcome-message">
            Bienvenido, {{ userStore.name }} {{ userStore.surname }}
          </h2>
        </div>

        <!-- Botón de nueva planilla (solo para usuarios estándar) -->
        <div v-if="!userStore.isAdmin" class="col-4">
          <div class="card text-center shadow" @click="nuevaPlanilla">
            <div class="card-body">
              <h3 class="card-title">+</h3>
              <p class="card-text">Nueva Planilla</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de Planillas -->
      <div class="row justify-content-center mt-4">
        <div class="col-12">
          <h3>
            Historial de Planillas 
            <span v-if="userStore.isAdmin">(Todos los usuarios)</span>
          </h3>
        </div>

        <div
          v-for="planilla in planillas"
          :key="planilla.id"
          class="col-md-4 mb-3"
        >
          <CardPlanilla
            :planilla="planilla"
            @click="abrirModal(planilla)"
          />
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
import NavbarComp from "@/components/NavbarComp.vue";
import CardPlanilla from "@/components/CardPlanilla.vue";
import ModalPlanilla from "@/components/ModalPlanilla.vue";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/user";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";

const db = getFirestore();

export default {
  name: "HomeView",
  components: {
    NavbarComp,
    CardPlanilla,
    ModalPlanilla,
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

    return { logout, nuevaPlanilla, userStore };
  },
  data() {
    return {
      planillas: [],
      modalVisible: false,
      planillaSeleccionada: null,
    };
  },
  async created() {
    const user = auth.currentUser;

    if (user) {
      try {
        let q;

        // Determinar si el usuario es administrador
        if (this.userStore.isAdmin) {
          // Admin: Obtener todas las planillas, ordenadas por fecha
          q = query(collection(db, "planillas"), orderBy("fechaCreacion", "desc"));
        } else {
          // Usuario estándar: Obtener solo las planillas del usuario
          q = query(
            collection(db, "planillas"),
            where("usuario.email", "==", user.email),
            orderBy("fechaCreacion", "desc")
          );
        }

        const querySnapshot = await getDocs(q);

        const planillas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (this.userStore.isAdmin) {
          const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
          const usuarios = usuariosSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc[data.email] = { name: data.name, surname: data.surname };
            return acc;
          }, {});

          this.planillas = planillas.map((planilla) => {
            const usuarioInfo = usuarios[planilla.usuario.email] || {};
            return {
              ...planilla,
              usuarioNombre: `${usuarioInfo.name || "N/A"} ${
                usuarioInfo.surname || ""
              }`,
            };
          });
        } else {
          this.planillas = planillas;
        }
      } catch (error) {
        console.error("Error al obtener las planillas:", error);
      }
    }
  },
  methods: {
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
    }
  },
};
</script>


<style scoped>
.container {
  margin-top: 20px;
}

.welcome-message {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.card-title {
  color: white;
}

.card.text-center {
  background-color: #007bff;
  color: white;
  border-radius: 15px;
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card.text-center:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.4);
}

.card.text-center h3 {
  font-size: 36px;
  font-weight: bold;
}

.card.text-center p {
  font-size: 18px;
}

h3 {
  font-size: 20px;
  color: #007bff;
  margin-bottom: 15px;
}
</style>
