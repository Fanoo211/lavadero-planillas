<template>
  <div class="card shadow" @click="onClick">
    <div class="card-body">
      <h5 class="card-title">{{ planilla.fecha }}</h5>
      <p class="card-text">
        <strong>Turno:</strong> {{ planilla.turno }}<br />
        <strong>Inicio:</strong> {{ planilla.horarioInicio }}<br />
        <strong>Fin:</strong> {{ planilla.horarioFin }}
      </p>
      <p v-if="planilla.usuarioNombre" class="card-text">
        Creado por: {{ planilla.usuarioNombre.toUpperCase() }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "CardPlanilla",
  props: {
    planilla: {
      type: Object,
      required: true,
    },
  },
  emits: ["click"],
  methods: {
    onClick() {
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.card {
  cursor: pointer;
  transition: transform 0.2s;
}
.card:hover {
  transform: scale(1.05);
}
</style>

<style scoped>
.card {
  cursor: pointer;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: #ffffff;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-body {
  text-align: left;
  color: #333;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.card-text {
  font-size: 14px;
  color: #555;
}
</style>

