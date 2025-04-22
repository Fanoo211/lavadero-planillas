<template>

  <NavbarComp :title="'Lavadero de Bandejas'" @logout="logout" />

  <div class="container mt-4">
    <div class="row">
      <!-- Columna Turno Mañana -->
      <div class="col-md-5 bg-light p-3 rounded">
        <h2 class="text-center mb-3">Turno Mañana</h2>
        <div class="row">
          <div
            v-for="(grafico, index) in graficosManana"
            :key="'manana-' + index"
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

      <div class="col-md-2 d-none d-md-flex justify-content-center">
        <div class="vr bg-secondary" style="height: 100%; width: 2px;"></div>
      </div>

      <!-- Columna Turno Tarde -->
      <div class="col-md-5 bg-light p-3 rounded">
        <h2 class="text-center mb-3">Turno Tarde</h2>
        <div class="row">
          <div
            v-for="(grafico, index) in graficosTarde"
            :key="'tarde-' + index"
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
</template>

<script>
import NavbarComp from "@/components/NavbarComp.vue";
import GraficoGenerico from "@/components/GraficoGenerico.vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useUserStore } from "../store/user";

export default {
  components: { GraficoGenerico, NavbarComp },
  data() {
    return {
      planillas: [],
    };
  },
  computed: {
    graficosManana() {
      return this.filtrarPorTurno("mañana");
    },
    graficosTarde() {
      return this.filtrarPorTurno("tarde");
    },
  },
  methods: {
    async cargarPlanillas() {
      const snapshot = await getDocs(collection(db, "planillas"));
      this.planillas = snapshot.docs.map((doc) => doc.data());
    },
    filtrarPorTurno(turno) {
      const authStore = useUserStore();
      const user = authStore.user;
      const isAdmin = authStore.isAdmin;

      const filtradas = isAdmin
        ? this.planillas.filter((p) => p.turno === turno)
        : this.planillas.filter(
            (p) => p.usuario === user.email && p.turno === turno
          );

      return this.generarGraficosDesdePlanillas(filtradas);
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
      let aprobados = 0;
      let rechazados = 0;

      planillas.forEach((p) => {
        p.controles?.forEach((c) => {
          c.estado ? aprobados++ : rechazados++;
        });
      });

      const total = aprobados + rechazados;

      return total === 0
        ? []
        : [
            { label: "Aprobado", valor: (aprobados / total) * 100 },
            { label: "Rechazado", valor: (rechazados / total) * 100 },
          ];
    },
    calcularFrecuenciaFallos(planillas) {
      const fallos = {};
      planillas.forEach((p) => {
        p.controles?.forEach((c) => {
          if (!c.estado) {
            fallos[c.pregunta] = (fallos[c.pregunta] || 0) + 1;
          }
        });
      });
      return Object.entries(fallos).map(([label, valor]) => ({ label, valor }));
    },
    calcularTendenciaCumplimiento(planillas) {
      const fechas = {};
      planillas.forEach((p) => {
        const fecha = p.fecha;
        if (!fechas[fecha]) fechas[fecha] = { total: 0, aprobados: 0 };
        p.controles?.forEach((c) => {
          fechas[fecha].total++;
          if (c.estado) fechas[fecha].aprobados++;
        });
      });
      return Object.entries(fechas).map(([label, datos]) => ({
        label,
        valor: (datos.aprobados / datos.total) * 100,
      }));
    },
    calcularDistribucionFallos(planillas) {
      const distribucion = {};
      planillas.forEach((p) => {
        p.controles?.forEach((c) => {
          if (!c.estado) {
            distribucion[c.pregunta] = (distribucion[c.pregunta] || 0) + 1;
          }
        });
      });
      return Object.entries(distribucion).map(([label, valor]) => ({
        label,
        valor,
      }));
    },
  },
  mounted() {
    this.cargarPlanillas();
  },
};
</script>


<style scoped>
/* Opcional: podrías agregar estilos personalizados acá si querés */
</style>
