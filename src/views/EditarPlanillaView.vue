<template>
  <div class="container mt-4">
    <h2>Editar Planilla</h2>
    <form @submit.prevent="guardarCambios">
      
      <div class="mb-3">
        <label class="form-label">Fecha</label>
        <input type="date" v-model="planilla.fecha" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Turno</label>
        <div>
          <div class="form-check form-check-inline">
            <input 
              class="form-check-input" 
              type="radio" 
              id="turnoManana" 
              value="mañana" 
              v-model="planilla.turno"
            />
            <label class="form-check-label" for="turnoManana">Mañana</label>
          </div>
          <div class="form-check form-check-inline">
            <input 
              class="form-check-input" 
              type="radio" 
              id="turnoTarde" 
              value="tarde" 
              v-model="planilla.turno"
            />
            <label class="form-check-label" for="turnoTarde">Tarde</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Horario de inicio</label>
        <input type="time" v-model="planilla.horarioInicio" class="form-control" required />
      </div>
      
      <div class="mb-3">
        <label class="form-label">Horario de fin</label>
        <input type="time" v-model="planilla.horarioFin" class="form-control" required />
      </div>

      <h4>Bandejas Lavadas</h4>
      <div v-for="(bandeja, index) in planilla.bandejas" :key="index" class="mb-3">
        <label class="form-label">{{ bandeja.tipo }}</label>
        <input type="number" v-model="bandeja.cantidad" class="form-control" min="0" required />
      </div>

      <h4>Controles</h4>
      
      <div class="mb-3">
        <label class="form-label">Kilómetros iniciales</label>
        <input type="number" v-model="planilla.kmInicio" class="form-control" min="0" step="0.01" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Kilómetros finales</label>
        <input type="number" v-model="planilla.kmFin" class="form-control" min="0" step="0.01" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Kilómetros recorridos</label>
        <input type="number" :value="formatKm(planilla.kmFin - planilla.kmInicio)" class="form-control" disabled />
      </div>

      <!-- N° de Unidad -->
      <div class="mb-3">
        <label class="form-label">N° de Unidad</label>
        <input type="text" v-model="planilla.numeroUnidad" class="form-control" required />
      </div>

      <div v-for="(control, index) in planilla.controles" :key="index" class="mb-3">
        <label class="form-label">{{ control.pregunta }}</label>
        <select v-model="control.estado" class="form-select">
          <option :value="true">✔ Sí</option>
          <option :value="false">✘ No</option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary">Guardar Cambios</button>
      <button type="button" class="btn btn-secondary ms-2" @click="cancelar">Cancelar</button>
    </form>
  </div>
</template>

<script>
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

export default {
  props: ["id"],
  data() {
    return {
      planilla: {
        fecha: "",
        turno: "",  // Se inicia vacío
        horarioInicio: "",
        horarioFin: "",
        kmInicio: 0,
        kmFin: 0,
        numeroUnidad: "",
        bandejas: [],
        controles: []
      },
    };
  },
  async created() {
    const db = getFirestore();
    const docRef = doc(db, "planillas", this.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      this.planilla = docSnap.data();
    } else {
      console.error("Planilla no encontrada");
    }
  },
  methods: {
    formatKm(value) {
      return parseFloat(value).toFixed(2); // Formateo de los kilómetros con 2 decimales
    },
    async guardarCambios() {
      if (this.planilla.kmFin < this.planilla.kmInicio) {
        alert("Los kilómetros finales no pueden ser menores que los iniciales.");
        return;
      }

      const db = getFirestore();
      const docRef = doc(db, "planillas", this.id);
      
      // Redondear los kilómetros a 2 decimales antes de guardar
      this.planilla.kmInicio = parseFloat(this.planilla.kmInicio).toFixed(2);
      this.planilla.kmFin = parseFloat(this.planilla.kmFin).toFixed(2);
      
      // Convertir el turno a minúsculas antes de guardar
      this.planilla.turno = this.planilla.turno.toLowerCase();

      // Calcular kilómetros recorridos antes de actualizar Firestore
      this.planilla.kmRecorridos = (this.planilla.kmFin - this.planilla.kmInicio).toFixed(2);

      try {
        await updateDoc(docRef, this.planilla);
        alert("Planilla actualizada con éxito.");
        this.$router.push("/home");
      } catch (error) {
        console.error("Error al actualizar la planilla:", error);
        alert("Ocurrió un error al guardar los cambios.");
      }
    },
    cancelar() {
      this.$router.push("/home");
    },
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
