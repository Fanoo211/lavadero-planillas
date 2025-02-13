<template>
  <!-- Navbar -->
  <NavbarComp :title="'Nueva Planilla'" @logout="logout" />
  <hr />
  <div class="nueva-planilla">
    <h1 class="mb-4">Nueva Planilla</h1>
    <form @submit.prevent="guardarPlanilla" :novalidate="true">
      
      <!-- Turno, Fecha y Horario -->
      <fieldset class="mb-4 p-4 border rounded" style="background-color: #FF9F00;">
        <legend class="fs-5 fw-bold">Turno, Fecha y Horario</legend>
        <div class="mb-3">
          <label class="form-label">Turno:</label>
          <div class="form-check form-check-inline">
            <input type="radio" v-model="turno" value="mañana" required class="form-check-input" :class="{'is-invalid': submitted && !turno}" />
            <label class="form-check-label">Mañana</label>
          </div>
          <div class="form-check form-check-inline">
            <input type="radio" v-model="turno" value="tarde" required class="form-check-input" :class="{'is-invalid': submitted && !turno}" />
            <label class="form-check-label">Tarde</label>
          </div>
          <div v-if="!turno && submitted" class="invalid-feedback d-block">El turno es obligatorio</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Fecha:</label>
          <input type="date" v-model="fecha" required class="form-control" :class="{'is-invalid': submitted && !fecha}" />
          <div v-if="!fecha && submitted" class="invalid-feedback">La fecha es obligatoria</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Horario:</label>
          <div class="d-flex gap-2">
            <input type="time" v-model="horarioInicio" required class="form-control" :class="{'is-invalid': submitted && !horarioInicio}" />
            <input type="time" v-model="horarioFin" required class="form-control" :class="{'is-invalid': submitted && !horarioFin}" />
          </div>
          <div v-if="(!horarioInicio || !horarioFin) && submitted" class="invalid-feedback d-block">Ambos horarios son obligatorios</div>
        </div>
      </fieldset>

      <!-- Bandejas Lavadas -->
      <fieldset class="mb-4 p-4 border rounded" style="background-color: #FF9F00;">
        <legend class="fs-5 fw-bold">Bandejas Lavadas</legend>
        <div class="mb-3">
          <div v-for="bandeja in bandejas" :key="bandeja.tipo" class="d-flex justify-content-between mb-2">
            <label>{{ bandeja.tipo }}:</label>
            <input type="number" v-model.number="bandeja.cantidad" min="0" class="form-control w-25" />
          </div>
        </div>
      </fieldset>

      <!-- Control Diario de Autoelevadores -->
      <fieldset class="mb-4 p-4 border rounded" style="background-color: #FF9F00;">
        <legend class="fs-5 fw-bold">Control Diario de Autoelevadores</legend>
        <div class="mb-3">
          <label class="form-label">N° de Unidad:</label>
          <input type="number" v-model="numeroUnidad" min="1" required class="form-control" :class="{'is-invalid': submitted && !numeroUnidad}" />
          <div v-if="!numeroUnidad && submitted" class="invalid-feedback">El número de unidad es obligatorio</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Kilómetros antes de iniciar:</label>
          <input type="text" :value="kmInicio" @input="handleKmInicioInput" required class="form-control" :class="{'is-invalid': submitted && !kmInicio}" />
          <div v-if="!kmInicio && submitted" class="invalid-feedback">Los kilómetros iniciales son obligatorios</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Kilómetros al finalizar:</label>
          <input type="text" :value="kmFin" @input="handleKmFinInput" required class="form-control" :class="{'is-invalid': submitted && !kmFin}" />
          <div v-if="!kmFin && submitted" class="invalid-feedback">Los kilómetros finales son obligatorios</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Kilómetros recorridos:</label>
          <input type="number" :value="kmRecorridos" disabled class="form-control" />
          <div v-if="kmRecorridos === 0 && submitted" class="invalid-feedback d-block">Los kilómetros recorridos no pueden ser cero</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Control Diario:</label>
          <div v-for="control in controles" :key="control.pregunta" class="form-check d-flex justify-content-between">
            <label>{{ control.pregunta }}</label>
            <input type="checkbox" v-model="control.estado" class="form-check-input" />
          </div>
        </div>
      </fieldset>

      <!-- Botones -->
      <div class="d-flex justify-content-between mb-4">
        <button type="submit" class="btn btn-success">Guardar</button>
        <button type="button" @click="cancelar" class="btn btn-danger">Cancelar</button>
      </div>

      <!-- Mensaje de error general -->
      <div v-if="submitted && hasErrors" class="alert alert-danger mt-4" role="alert">
        Todos los campos obligatorios deben ser completados.
      </div>
    </form>
  </div>
</template>

<script>
import NavbarComp from "@/components/NavbarComp.vue";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";

const db = getFirestore();

export default {
  name: "NuevaPlanillaView",
  components: {
    NavbarComp,
  },
  setup() {
    const router = useRouter();

    const logout = async () => {
      try {
        await signOut(auth);
        router.push("/");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    return { logout };
  },
  data() {
    return {
      turno: "",
      fecha: "",
      numeroUnidad: "",
      horarioInicio: "",
      horarioFin: "",
      kmInicio: "0",
      kmFin: "0",
      bandejas: [
        { tipo: "Sacheteras Leche Fluida", cantidad: 0 },
        { tipo: "Sacheteras Yogur", cantidad: 0 },
        { tipo: "Bandejas Crema", cantidad: 0 },
        { tipo: "Bandejas para el Fluido", cantidad: 0 },
        { tipo: "Cereal", cantidad: 0 },
        { tipo: "Bandejas Barra Blancas", cantidad: 0 },
        { tipo: "Bandejas Barra Negra", cantidad: 0 },
        { tipo: "Bandejas Cremoso Verde", cantidad: 0 },
        { tipo: "Bandejas Cremoso", cantidad: 0 },
        { tipo: "Bandejas Potes", cantidad: 0 },
      ],
      controles: [
        { pregunta: "Estado de banda de rodaje", estado: false },
        { pregunta: "Presión de neumáticos", estado: false },
        { pregunta: "Brazos de la horquilla / uñas", estado: false },
        { pregunta: "Pérdidas del fluido hidráulico", estado: false },
        { pregunta: "Nivel de aceite del circuito hidráulico", estado: false },
        { pregunta: "Nivel de aceite del motor", estado: false },
        { pregunta: "Funcionamiento de los mandos de servicio", estado: false },
        { pregunta: "Funcionamiento de bocina", estado: false },
        { pregunta: "Funcionamiento de las luces", estado: false },
        { pregunta: "Funcionamiento de la alarma de aviso de retroceso", estado: false },
        { pregunta: "Funcionamiento del freno de pie", estado: false },
        { pregunta: "Funcionamiento del freno de mano", estado: false },
        { pregunta: "Estado de los espejos retrovisores", estado: false },
        { pregunta: "Tiene matafuego cargado", estado: false },
        { pregunta: "Tiene cinturón de seguridad", estado: false },
        { pregunta: "Funcionamiento del sistema de transmisión de movimientos de izaje", estado: false },
        { pregunta: "Estado del asiento", estado: false },
        { pregunta: "Nivel de agua del radiador", estado: false },
      ],
      submitted: false,
    };
  },
 computed: {
    kmRecorridos() {
      const inicio = parseFloat(this.kmInicio.replace(",", "."));
      const fin = parseFloat(this.kmFin.replace(",", "."));
      const recorridos = fin - inicio;
      return isNaN(recorridos) ? 0 : recorridos % 1 === 0 ? recorridos : recorridos.toFixed(2);
    },
    hasErrors() {
      return !this.turno || !this.fecha || !this.horarioInicio || !this.horarioFin || !this.kmsInicio || !this.kmsFin;
    }
  },
  watch: {
    kmInicio(value) {
      this.kmInicio = value.replace(",", ".");
    },
    kmFin(value) {
      this.kmFin = value.replace(",", ".");
    },
  },
  methods: {
    async fetchUserInfo() {
    const user = auth.currentUser;
    if (!user) {
      console.error("No hay un usuario autenticado.");
      return null;
    }

    try {
      const q = query(collection(db, "usuarios"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return { name: userData.name, surname: userData.surname };
      } else {
        console.warn("Usuario no encontrado en la colección 'usuarios'.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      return null;
    }
  },
    async guardarPlanilla() {
      this.submitted = true;

      // Validación de errores
      if (!this.turno || !this.fecha || !this.horarioInicio || !this.horarioFin) {
        this.scrollToTop(); // 🔥 Hacer scroll hacia arriba si hay errores
        return;
      }

      if (
        !this.turno ||
        !this.fecha ||
        !this.horarioInicio ||
        !this.horarioFin ||
        !this.numeroUnidad ||
        !this.kmInicio ||
        !this.kmFin ||
        this.kmRecorridos === 0
      ) {
        console.log("Faltan campos obligatorios");
        return;
      }

       const userInfo = await this.fetchUserInfo();
      if (!userInfo) {
        alert("No se pudo guardar la planilla porque los datos del usuario no están disponibles.");
        return;
      }

      const planilla = {
        turno: this.turno,
        fecha: this.fecha,
        numeroUnidad: this.numeroUnidad,
        horarioInicio: this.horarioInicio,
        horarioFin: this.horarioFin,
        kmInicio: this.kmInicio,
        kmFin: this.kmFin,
        kmRecorridos: this.kmRecorridos,
        bandejas: this.bandejas,
        controles: this.controles,
        usuario: { name: userInfo.name, surname: userInfo.surname, email: auth.currentUser.email },
        fechaCreacion: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, "planillas"), planilla);
        alert("Planilla guardada con éxito.");
        this.$router.push("/home");
      } catch (error) {
        console.error("Error al guardar la planilla:", error);
        alert("Ocurrió un error al guardar la planilla.");
      }
    },
    cancelar() {
      this.$router.push("/home");
    },
    handleKmInicioInput(event) {
      this.kmInicio = event.target.value;
    },
    handleKmFinInput(event) {
      this.kmFin = event.target.value;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth" // 🔥 Animación suave de desplazamiento
      });
    }
  },
};
</script>

<style scoped>
.nueva-planilla {
  max-width: 800px;
  margin: 0 auto;
}

hr {
  margin: 20px 0;
}

legend {
  font-weight: bold;
}

.fs-6 {
  font-size: 0.875rem;
}

.text-danger {
  color: red;
}

.btn {
  width: 48%;
}

.form-check-label {
  padding-right: 10px; /* Añade un pequeño espacio entre el label y el checkbox */
}

.form-check-input {
  order: 2; /* Mueve el checkbox al lado derecho */
}

/* Añadir espacio debajo de los botones */
.d-flex.mb-4 {
  margin-bottom: 30px; /* Espacio adicional */
}
</style>

