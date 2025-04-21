<template>
  <div>
    <canvas ref="grafico"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  registerables
} from 'chart.js';
import {
  ref,
  onMounted,
  watch,
  nextTick
} from 'vue';

Chart.register(...registerables);

export default {
  props: {
    datos: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const grafico = ref(null);
    let chart = null;

    const renderChart = () => {
      nextTick(() => {
        if (!grafico.value) return;

        const ctx = grafico.value.getContext("2d");

        if (chart) {
          chart.destroy();
        }

        const labels = props.datos.map(d => d.mes);
        const data = props.datos.map(d => d.cantidad);

        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Cantidad de Planillas',
              data: data,
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true
              },
              tooltip: {
                enabled: true
              },
              title: {
                display: true,
                text: 'Planillas agrupadas por mes'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      });
    };

    onMounted(() => {
      if (props.datos.length) {
        renderChart();
      }
    });

    watch(() => props.datos, () => {
      renderChart();
    }, { immediate: true });

    return {
      grafico
    };
  }
};
</script>
