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
          <p v-if="isAdmin"><strong>Usuario: {{ planilla.usuarioNombre.toUpperCase() }}</strong></p>
          <p><strong>Fecha:</strong> {{ planilla.fecha }}</p>
          <p><strong>Turno:</strong> {{ planilla.turno }}</p>
          <p>
            <strong>Horario:</strong>
            {{ planilla.horarioInicio }} - {{ planilla.horarioFin }}
          </p>
          <h6>Bandejas Lavadas:</h6>
          <ul>
            <li v-for="bandeja in planilla.bandejas" :key="bandeja.tipo">
              {{ bandeja.tipo }}: {{ bandeja.cantidad }}
            </li>
          </ul>
          <h6>Controles:</h6>
          <ul>
            <li v-for="control in planilla.controles" :key="control.pregunta">
              {{ control.pregunta }}: {{ control.estado ? "✔" : "✘" }}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cerrar
          </button>
          <button type="button" class="btn btn-warning" @click="editarPlanilla">
            Editar
          </button>
          <button type="button" class="btn btn-danger" @click="eliminarPlanilla">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const db = getFirestore();

export default {
  name: "ModalPlanilla",
  props: {
    planilla: {
      type: Object,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();

    const editarPlanilla = () => {
      router.push(`/editar-planilla/${props.planilla.id}`);
    };

    const eliminarPlanilla = async () => {
      if (confirm("¿Estás seguro de que quieres eliminar esta planilla?")) {
        try {
          await deleteDoc(doc(db, "planillas", props.planilla.id));
          emit("planillaEliminada", props.planilla.id); // Notifica al HomeView
          emit("close"); // Cierra el modal
        } catch (error) {
          console.error("Error eliminando la planilla:", error);
        }
      }
    };

    return { editarPlanilla, eliminarPlanilla };
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
  border-radius: 5px;
  transition: background-color 0.3s;
}

.modal-footer .btn-warning {
  background-color: #ffc107;
  color: black;
}

.modal-footer .btn-warning:hover {
  background-color: #e0a800;
}

.modal-footer .btn-danger {
  background-color: #dc3545;
}

.modal-footer .btn-danger:hover {
  background-color: #c82333;
}
</style>
