<template>
  <NavbarComp :title="''" @logout="logout" />

  <div class="container mt-4">
    <!-- Filtro por año y mes -->
    <div class="row mb-4 justify-content-center">
      <div class="col-6 col-md-4">
        <label class="form-label text-center d-block">
          🔍 Filtrar período
        </label>
        <VueDatePicker
          v-model="month"
          locale="es"
          month-picker
          :format="'MM/yyyy'"
          :disabled="false"
          :clearable="false"
          @change="cargarPlanillas"
        />
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
import VueDatePicker from '@vuepic/vue-datepicker';

export default {
  components: { NavbarComp, GraficoGenerico, VueDatePicker },
  data() {
    return {
      planillas: [],
      month: {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
      },
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
  watch: {
    month: {
      handler() {
        this.cargarPlanillas();
      },
      deep: true,
    },
  },
  methods: {
    async cargarPlanillas() {
      const snapshot = await getDocs(collection(db, "planillas"));
      let todas = snapshot.docs.map((doc) => doc.data());

      // Filtrar por mes y año seleccionado (usando UTC)
      const sel = new Date(this.month.year, this.month.month, 1);
      todas = todas.filter((p) => {
        const d = new Date(p.fecha);
        return (
          d.getUTCFullYear() === sel.getUTCFullYear() &&
          d.getUTCMonth() === sel.getUTCMonth()
        );
      });

      // Si no es admin, filtrar por el email dentro del objeto usuario
      const authStore = useUserStore();
      if (!authStore.isAdmin) {
        const email = getAuth().currentUser?.email || "";
        todas = todas.filter((p) => p.usuario?.email === email);
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
      return Object.entries(f).map(([lab, val]) => ({ label: lab, valor: val }));
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
        .map(([lab, d]) => ({ label: lab, valor: (d.app / d.tot) * 100 }));
    },

    calcularDistribucionFallos(planillas) {
      const dist = {};
      planillas.forEach((p) =>
        p.controles?.forEach((c) => {
          if (!c.estado) dist[c.pregunta] = (dist[c.pregunta] || 0) + 1;
        })
      );
      return Object.entries(dist).map(([lab, val]) => ({ label: lab, valor: val }));
    },

    logout() {
      //...
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
