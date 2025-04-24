<template>
  <div class="container mt-4">
    <NavbarComp :title="''" @logout="logout" />

    <!-- Filtro dinámico -->
    <div class="row mb-4 justify-content-center">
      <div class="col-6 col-md-4">
        <label for="filtroPeriodo" class="form-label text-center d-block">
          🔍 Filtrar período
        </label>
        <select id="filtroPeriodo" class="form-select" v-model.number="filtroPeriodo">
          <option :value="7">Últimos 7 días</option>
          <option :value="30">Últimos 30 días</option>
          <option :value="90">Últimos 90 días</option>
          <option :value="0">Todos</option>
        </select>
      </div>
    </div>

    <div class="row gx-4 gy-5">
      <!-- Turno Mañana -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-header text-white text-center" style="background-color: #FF9F00;">
            <h4 class="mb-0">Turno Mañana</h4>
            <small>Planillas: <strong>{{ planillasManana.length }}</strong></small>
          </div>
          <div class="card-body">
            <div class="row">
              <div
                v-for="(grafico, idx) in graficosManana"
                :key="'manana-' + idx"
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

      <!-- Turno Tarde -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-header text-white text-center" style="background-color: #FF9F00;">
            <h4 class="mb-0">Turno Tarde</h4>
            <small>Planillas: <strong>{{ planillasTarde.length }}</strong></small>
          </div>
          <div class="card-body">
            <div class="row">
              <div
                v-for="(grafico, idx) in graficosTarde"
                :key="'tarde-' + idx"
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
  </div>
</template>

<script>
import NavbarComp from "@/components/NavbarComp.vue";
import GraficoGenerico from "@/components/GraficoGenerico.vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { useUserStore } from "../store/user";

export default {
  components: { NavbarComp, GraficoGenerico },
  data() {
    return {
      planillas: [],
      filtroPeriodo: 30,
    };
  },
  computed: {
    planillasManana() {
      return this.planillasPorTurno("mañana");
    },
    planillasTarde() {
      return this.planillasPorTurno("tarde");
    },
    graficosManana() {
      return this.generarGraficosDesdePlanillas(this.planillasManana);
    },
    graficosTarde() {
      return this.generarGraficosDesdePlanillas(this.planillasTarde);
    },
  },
  methods: {
    async cargarPlanillas() {
      const snapshot = await getDocs(collection(db, "planillas"));
      let todas = snapshot.docs.map((doc) => doc.data());

      // Filtrar por periodo
      if (this.filtroPeriodo > 0) {
        const desde = new Date();
        desde.setDate(desde.getDate() - this.filtroPeriodo);
        todas = todas.filter((p) => new Date(p.fecha) >= desde);
      }

      // Filtrar por usuario si no es admin
      const authStore = useUserStore();
      if (!authStore.isAdmin) {
        const email = getAuth().currentUser?.email || "";
        todas = todas.filter((p) => {
          if (p.usuario && typeof p.usuario === "object") {
            return p.usuario.email === email;
          }
          return p.usuario === email;
        });
      }

      this.planillas = todas;
    },

    planillasPorTurno(turno) {
      return this.planillas.filter((p) => p.turno === turno);
    },

    generarGraficosDesdePlanillas(planillas) {
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
      let aprob = 0, rej = 0;
      planillas.forEach((p) =>
        p.controles?.forEach((c) => (c.estado ? aprob++ : rej++))
      );
      const total = aprob + rej;
      return total
        ? [
            { label: "Aprobado", valor: (aprob / total) * 100 },
            { label: "Rechazado", valor: (rej / total) * 100 },
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
      return Object.entries(f).map(([label, valor]) => ({ label, valor }));
    },

    calcularTendenciaCumplimiento(planillas) {
      const fechas = {};
      planillas.forEach((p) => {
        if (!fechas[p.fecha]) fechas[p.fecha] = { total: 0, aprob: 0 };
        p.controles?.forEach((c) => {
          fechas[p.fecha].total++;
          if (c.estado) fechas[p.fecha].aprob++;
        });
      });
      return Object.entries(fechas)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([label, d]) => ({
          label,
          valor: (d.aprob / d.total) * 100,
        }));
    },

    calcularDistribucionFallos(planillas) {
      const dist = {};
      planillas.forEach((p) =>
        p.controles?.forEach((c) => {
          if (!c.estado) dist[c.pregunta] = (dist[c.pregunta] || 0) + 1;
        })
      );
      return Object.entries(dist).map(([label, valor]) => ({ label, valor }));
    },

    logout() {
      // lógica de logout...
    },
  },
  watch: {
    filtroPeriodo() {
      this.cargarPlanillas();
    },
  },
  mounted() {
    this.cargarPlanillas();
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
