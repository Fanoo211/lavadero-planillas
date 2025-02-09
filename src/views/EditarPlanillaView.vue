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
        <input type="text" v-model="planilla.turno" class="form-control" required />
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
        <input type="number" v-model="planilla.kmInicio" class="form-control" min="0" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Kilómetros finales</label>
        <input type="number" v-model="planilla.kmFin" class="form-control" min="0" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Kilómetros recorridos</label>
        <input type="number" :value="planilla.kmFin - planilla.kmInicio" class="form-control" disabled />
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
        turno: "",
        horarioInicio: "",
        horarioFin: "",
        kmInicio: 0,
        kmFin: 0,
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
    async guardarCambios() {
      if (this.planilla.kmFin < this.planilla.kmInicio) {
        alert("Los kilómetros finales no pueden ser menores que los iniciales.");
        return;
      }

      const db = getFirestore();
      const docRef = doc(db, "planillas", this.id);
      
      // Calcular kilómetros recorridos antes de actualizar Firestore
      this.planilla.kmRecorridos = this.planilla.kmFin - this.planilla.kmInicio;

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
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
