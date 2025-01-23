<template>
  <div
    class="modal fade show"
    tabindex="-1"
    role="dialog"
    style="display: block; background: rgba(0, 0, 0, 0.5);"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalles de la Planilla</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <p><strong>Fecha:</strong> {{ planilla.fecha }}</p>
          <p><strong>Turno:</strong> {{ planilla.turno }}</p>
          <p>
            <strong>Horario:</strong>
            {{ planilla.horarioInicio }} - {{ planilla.horarioFin }}
          </p>
          <h6>Bandejas Lavadas:</h6>
          <ul>
            <li
              v-for="bandeja in planilla.bandejas"
              :key="bandeja.tipo"
            >
              {{ bandeja.tipo }}: {{ bandeja.cantidad }}
            </li>
          </ul>
          <h6>Controles:</h6>
          <ul>
            <li
              v-for="control in planilla.controles"
              :key="control.pregunta"
            >
              {{ control.pregunta }}: {{ control.estado ? "✔" : "✘" }}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalPlanilla",
  props: {
    planilla: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.modal-content {
  border-radius: 15px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.modal-body {
  font-size: 16px;
  color: #444;
  line-height: 1.5;
}

.modal-footer {
  border-top: 2px solid #e0e0e0;
}

.modal-footer button {
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.modal-footer button:hover {
  background-color: #0056b3;
}
</style>

