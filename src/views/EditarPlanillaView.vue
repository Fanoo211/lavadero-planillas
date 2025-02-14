<template>
  <!-- Navbar -->
  <NavbarComp :title="'Editar Planilla'" @logout="logout" />
  <hr />

  <div class="container mt-4">
    <form @submit.prevent="guardarCambios">
      
      <!-- Turno, Fecha y Horario -->
      <fieldset class="mb-4 p-4 border rounded" style="background-color: #FF9F00;">
        <legend class="fs-5 fw-bold">Turno, Fecha y Horario</legend>
        <div class="mb-3">
          <label class="form-label">Turno:</label>
          <div class="form-check form-check-inline">
            <input type="radio" id="turno-manana" v-model="planilla.turno" value="mañana" class="form-check-input" />
            <label for="turno-manana" class="form-check-label">Mañana</label>
          </div>
          <div class="form-check form-check-inline">
            <input type="radio" id="turno-tarde" v-model="planilla.turno" value="tarde" class="form-check-input" />
            <label for="turno-tarde" class="form-check-label">Tarde</label>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Fecha:</label>
          <input type="date" v-model="planilla.fecha" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Horario:</label>
          <div class="d-flex gap-2">
            <input type="time" v-model="planilla.horarioInicio" class="form-control" required />
            <input type="time" v-model="planilla.horarioFin" class="form-control" required />
          </div>
        </div>
      </fieldset>

      <!-- Bandejas Lavadas -->
      <fieldset class="mb-4 p-4 border rounded" style="background-color: #FF9F00;">
        <legend class="fs-5 fw-bold">Bandejas Lavadas</legend>
        <div class="mb-3">
          <div v-for="(bandeja, index) in planilla.bandejas" :key="index" class="d-flex justify-content-between mb-2">
            <label>{{ bandeja.tipo }}:</label>
            <input type="number" v-model="bandeja.cantidad" min="0" class="form-control w-25" required />
          </div>
        </div>
      </fieldset>

      <!-- Control Diario de Autoelevadores -->
      <fieldset class="mb-4 p-4 border rounded" style="background-color: #FF9F00;">
        <legend class="fs-5 fw-bold">Control Diario de Autoelevadores</legend>
        <div class="mb-3">
          <label class="form-label">Kilómetros Iniciales:</label>
          <input type="number" v-model="planilla.kmInicio" class="form-control" min="0" step="0.01" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Kilómetros Finales:</label>
          <input type="number" v-model="planilla.kmFin" class="form-control" min="0" step="0.01" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Kilómetros Recorridos:</label>
          <input type="number" :value="formatKm(planilla.kmFin - planilla.kmInicio)" class="form-control" disabled />
        </div>

        <div class="mb-3">
          <label class="form-label">N° de Unidad:</label>
          <input type="text" v-model="planilla.numeroUnidad" class="form-control" required />
        </div>

        <div v-for="(control, index) in planilla.controles" :key="index" class="mb-3">
          <label class="form-label">{{ control.pregunta }}</label>
          <select v-model="control.estado" class="form-select">
            <option :value="true">✔ Sí</option>
            <option :value="false">✘ No</option>
          </select>
        </div>
      </fieldset>

      <!-- Botones -->
      <div class="d-flex justify-content-between mb-4">
        <button type="submit" class="btn btn-success">Guardar Cambios</button>
        <button type="button" class="btn btn-danger" @click="cancelar">Cancelar</button>
      </div>
    </form>
  </div>

  <!-- Modal de Éxito -->
  <div class="modal fade" id="successModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">Éxito</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          Planilla actualizada con éxito.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="$router.push('/home')">Aceptar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Error -->
  <div class="modal fade" id="errorModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Error</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          {{ errorMessage }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import NavbarComp from "@/components/NavbarComp.vue";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

export default {
  components: {
    NavbarComp,
  },
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
        numeroUnidad: "",
        bandejas: [],
        controles: [],
      },
      errorMessage: "",
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
      return parseFloat(value).toFixed(2);
    },
    async guardarCambios() {
      if (this.planilla.kmFin < this.planilla.kmInicio) {
        this.errorMessage = "Los kilómetros finales no pueden ser menores que los iniciales.";
        new bootstrap.Modal(document.getElementById("errorModal")).show();
        return;
      }

      const db = getFirestore();
      const docRef = doc(db, "planillas", this.id);

      try {
        await updateDoc(docRef, {
          ...this.planilla,
          kmRecorridos: (this.planilla.kmFin - this.planilla.kmInicio).toFixed(2),
        });

        new bootstrap.Modal(document.getElementById("successModal")).show();
      } catch (error) {
        this.errorMessage = "Ocurrió un error al guardar los cambios.";
        new bootstrap.Modal(document.getElementById("errorModal")).show();
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
  max-width: 800px;
}
</style>
