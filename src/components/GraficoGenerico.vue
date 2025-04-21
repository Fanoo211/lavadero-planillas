<template>
  <div>
    <canvas ref="graficoCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import { ref, onMounted, watch, nextTick } from "vue";

Chart.register(...registerables);

export default {
  props: {
    datos: {
      type: Array,
      required: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      default: "bar",
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const graficoCanvas = ref(null);
    let chart = null;

    const renderChart = () => {
      nextTick(() => {
        if (!graficoCanvas.value) return;

        const ctx = graficoCanvas.value.getContext("2d");

        if (chart) chart.destroy();

        const labels = props.datos.map((d) => d.label);
        const data = props.datos.map((d) => d.valor);

        // 🎯 Colores personalizados para el gráfico de porcentaje
        let backgroundColor = "#42A5F5";
        let borderColor = "#1E88E5";

        if (props.titulo.toLowerCase().includes("porcentaje")) {
          backgroundColor = labels.map((label) =>
            label.toLowerCase().includes("aprobado") ? "#4CAF50" : "#F44336"
          );
          borderColor = labels.map((label) =>
            label.toLowerCase().includes("aprobado") ? "#388E3C" : "#D32F2F"
          );
        }

        chart = new Chart(ctx, {
          type: props.tipo,
          data: {
            labels,
            datasets: [
              {
                label: props.titulo,
                data,
                backgroundColor,
                borderColor,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            indexAxis: props.horizontal ? "y" : "x",
            plugins: {
              legend: {
                display: props.tipo !== "bar",
              },
              title: {
                display: true,
                text: props.titulo,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        });
      });
    };

    onMounted(() => {
      if (props.datos.length) {
        renderChart();
      }
    });

    watch(
      () => props.datos,
      () => {
        renderChart();
      },
      { immediate: true }
    );

    return {
      graficoCanvas,
    };
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
