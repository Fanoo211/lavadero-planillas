<template>
  <div class="row gx-4 gy-5">
    <!-- Suponemos que el usuario ve ambos turnos igual que el admin,
         o bien podrías personalizarlo para que sólo muestre su turno actual -->
    <div
      class="col-md-6"
      v-for="turno in ['mañana', 'tarde']"
      :key="turno"
    >
      <div class="card shadow-sm h-100">
        <div
          class="card-header text-white text-center"
          style="background-color: #1976D2;"
        >
          <h4 class="mb-0">Turno {{ turno }}</h4>
          <small>
            Tus planillas:
            <strong>{{ planillasPorTurno(turno).length }}</strong>
          </small>
        </div>
        <div class="card-body">
          <div class="row">
            <div
              v-for="(grafico, idx) in generarGraficosDesdePlanillas(planillasPorTurno(turno))"
              :key="idx"
              class="col-12 mb-4"
            >
              <GraficoGenerico
                :datos="grafico.datos"
                :titulo="grafico.titulo"
                :tipo="grafico.tipo"
                :horizontal="grafico.horizontal"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GraficoGenerico from "./GraficoGenerico.vue";

export default {
  name: "EstadisticasUsuario",
  components: { GraficoGenerico },
  props: {
    planillas: { type: Array, required: true },
  },
  methods: {
    planillasPorTurno(turno) {
      return this.planillas.filter((p) => p.turno === turno);
    },

    generarGraficosDesdePlanillas(planillas) {
      // Reutiliza la misma estructura que en Admin
      return [
        {
          titulo: "Porcentaje de controles aprobados",
          datos: this.calcularPorcentajeControles(planillas),
          tipo: "doughnut",
        },
        {
          titulo: "Frecuencia de fallos",
          datos: this.calcularFrecuenciaFallos(planillas),
          tipo: "bar",
        },
        {
          titulo: "Tendencia de cumplimiento",
          datos: this.calcularTendenciaCumplimiento(planillas),
          tipo: "line",
        },
        {
          titulo: "Distribución de fallos",
          datos: this.calcularDistribucionFallos(planillas),
          tipo: "bar",
          horizontal: true,
        },
      ];
    },

    calcularPorcentajeControles(planillas) {
      let aprob = 0,
        rej = 0;
      planillas.forEach((p) =>
        p.controles?.forEach((c) => (c.estado ? aprob++ : rej++))
      );
      const t = aprob + rej;
      return t
        ? [
            { label: "Aprobado", valor: (aprob / t) * 100 },
            { label: "Rechazado", valor: (rej / t) * 100 },
          ]
        : [];
    },

    calcularFrecuenciaFallos(planillas) {
      const f = {};
      planillas.forEach((p) =>
        p.controles?.forEach((c) => {
          if (!c.estado) f[c.pregunta] = (f[c.pregunta] || 0) + 1;
        })
      );
      return Object.entries(f).map(([label, val]) => ({
        label,
        valor: val,
      }));
    },

    calcularTendenciaCumplimiento(planillas) {
      const m = {};
      planillas.forEach((p) => {
        if (!m[p.fecha]) m[p.fecha] = { tot: 0, app: 0 };
        p.controles?.forEach((c) => {
          m[p.fecha].tot++;
          if (c.estado) m[p.fecha].app++;
        });
      });
      return Object.entries(m)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([label, d]) => ({
          label,
          valor: (d.app / d.tot) * 100,
        }));
    },

    calcularDistribucionFallos(planillas) {
      const dist = {};
      planillas.forEach((p) =>
        p.controles?.forEach((c) => {
          if (!c.estado) dist[c.pregunta] = (dist[c.pregunta] || 0) + 1;
        })
      );
      return Object.entries(dist).map(([label, val]) => ({
        label,
        valor: val,
      }));
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 1rem;
}
.card-header h4 {
  font-weight: 600;
}
</style>
