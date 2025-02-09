<template>
            <!-- Navbar -->
    <NavbarComp :title="'Nueva Planilla'" @logout="logout" />
    <hr>
  <div class="nueva-planilla">
    <h1>Nueva Planilla</h1>
    <form @submit.prevent="guardarPlanilla">
      <!-- Turno, Fecha y Horario -->
      <fieldset>
        <legend>Turno, Fecha y Horario</legend>
        <div class="form-group">
          <label>Turno:</label>
          <div>
            <label>
              <input type="radio" v-model="turno" value="mañana" /> Mañana
            </label>
            <label>
              <input type="radio" v-model="turno" value="tarde" /> Tarde
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Fecha:</label>
          <input type="date" v-model="fecha" required />
        </div>
        <div class="form-group">
          <label>Horario:</label>
          <div>
            <label>
              Inicio:
              <input type="time" v-model="horarioInicio" required />
            </label>
            <label>
              Fin:
              <input type="time" v-model="horarioFin" required />
            </label>
          </div>
        </div>
      </fieldset>

      <!-- Bandejas Lavadas -->
      <fieldset>
        <legend>Bandejas Lavadas</legend>
        <div class="form-group">
          <div v-for="bandeja in bandejas" :key="bandeja.tipo" class="bandeja-item">
            <label>{{ bandeja.tipo }}:</label>
            <input type="number" v-model.number="bandeja.cantidad" min="0" />
          </div>
        </div>
      </fieldset>

      <!-- Control Diario de Autoelevadores -->
      <fieldset>
        <legend>Control Diario de Autoelevadores</legend>
        <div class="form-group">
          <label>N° de Unidad:</label>
          <input type="number" v-model="numeroUnidad" min="1" required />
        </div>
        <div class="form-group">
          <label>Kilómetros antes de iniciar:</label>
          <input type="number" v-model.number="kmInicio" min="0" required />
        </div>
        <div class="form-group">
          <label>Kilómetros al finalizar:</label>
          <input type="number" v-model.number="kmFin" min="0" required />
        </div>
        <div class="form-group">
          <label>Kilómetros recorridos:</label>
          <input type="number" :value="kmRecorridos" disabled />
        </div>
        <div class="form-group">
          <label>Control Diario:</label>
          <div v-for="control in controles" :key="control.pregunta" class="control-item">
            <label>{{ control.pregunta }}</label>
            <input type="checkbox" v-model="control.estado" />
          </div>
        </div>
      </fieldset>

      <!-- Botones -->
      <div class="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" @click="cancelar">Cancelar</button>
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
      kmInicio: 0,
      kmFin: 0,
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
    };
  },
  computed: {
    kmRecorridos() {
      return this.kmFin - this.kmInicio;
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
  },
};
</script>



<style scoped>
.nueva-planilla {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}

form fieldset {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
}

form legend {
  font-size: 1.2em;
  font-weight: bold;
}

.form-group {
  margin-bottom: 15px;
}

.bandeja-item,
.control-item {
  margin: 10px 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"] {
  background: #4caf50;
  color: white;
}

button[type="button"] {
  background: #f44336;
  color: white;
}
</style>








