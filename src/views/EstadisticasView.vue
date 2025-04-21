<template>
  <div>
    <NavbarComp :title="'Estadísticas Mensuales'" @logout="logout" />

    <div class="container mt-4">
      <h2 class="text-center mb-4">Estadísticas Generales</h2>

      <div v-if="cargando" class="text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Cargando estadísticas...</p>
      </div>

      <div v-else>
        <GraficoGenerico 
          :datos="planillasPorMes" 
          tipo="bar" 
          titulo="Planillas por Mes" 
        />

        <GraficoGenerico 
          :datos="porcentajeAprobados" 
          tipo="doughnut" 
          titulo="Porcentaje de Controles Aprobados" 
        />

        <GraficoGenerico 
          :datos="frecuenciaFallos" 
          tipo="bar" 
          titulo="Frecuencia de Fallos por Control" 
        />

        <GraficoGenerico 
          :datos="tendenciaCumplimiento" 
          tipo="line" 
          titulo="Tendencia de Cumplimiento en el Tiempo" 
        />

        <GraficoGenerico 
          :datos="distribucionFallos" 
          tipo="bar" 
          titulo="Distribución de Fallos Combinados" 
          :horizontal="true" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import NavbarComp from "@/components/NavbarComp.vue";
import GraficoGenerico from "@/components/GraficoGenerico.vue";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { useUserStore } from "@/store/user";

export default {
  components: { NavbarComp, GraficoGenerico },
  data() {
    return {
      cargando: true,
      planillasPorMes: [],
      porcentajeAprobados: [],
      frecuenciaFallos: [],
      tendenciaCumplimiento: [],
      distribucionFallos: [],
    };
  },
  async created() {
    await this.cargarEstadisticas();
  },
  methods: {
    async logout() {
      await signOut(auth);
      this.$router.push("/");
    },
    async cargarEstadisticas() {
      this.cargando = true;
      const db = getFirestore();
      const userStore = useUserStore();
      const user = auth.currentUser;

      try {
        let planillasQuery;

        if (userStore.isAdmin) {
          planillasQuery = query(collection(db, "planillas"));
        } else {
          planillasQuery = query(
            collection(db, "planillas"),
            where("usuario.email", "==", user.email)
          );
        }

        const snapshot = await getDocs(planillasQuery);
        const planillas = snapshot.docs.map(doc => doc.data());

        // === Planillas por mes ===
        const agrupadas = {};
        const cumplimientoPorMes = {};

        let aprobados = 0, rechazados = 0;
        const fallos = {};
        const combinaciones = {};

        planillas.forEach(planilla => {
          const fecha = new Date(planilla.fecha);
          const mes = fecha.toLocaleString("default", { month: "long", year: "numeric" });

          // Planillas por mes
          agrupadas[mes] = (agrupadas[mes] || 0) + 1;

          // Cumplimiento por mes
          const total = planilla.controles.length;
          const correctos = planilla.controles.filter(c => c.estado).length;
          cumplimientoPorMes[mes] = cumplimientoPorMes[mes] || { total: 0, correctos: 0 };
          cumplimientoPorMes[mes].total += total;
          cumplimientoPorMes[mes].correctos += correctos;

          // Porcentaje de controles aprobados
          aprobados += correctos;
          rechazados += total - correctos;

          // Frecuencia de fallos
          planilla.controles.forEach(c => {
            if (!c.estado) {
              fallos[c.pregunta] = (fallos[c.pregunta] || 0) + 1;
            }
          });

          // Distribución de fallos combinados
          const comboFallos = planilla.controles
            .filter(c => !c.estado)
            .map(c => c.pregunta)
            .sort()
            .join(" + ") || "Sin fallos";

          combinaciones[comboFallos] = (combinaciones[comboFallos] || 0) + 1;
        });

        // === Formateo de datos para gráficos ===

        this.planillasPorMes = Object.entries(agrupadas).map(([label, valor]) => ({ label, valor }));
        this.planillasPorMes.sort((a, b) => new Date("1 " + a.label) - new Date("1 " + b.label));

        this.porcentajeAprobados = [
          { label: "Aprobados", valor: aprobados },
          { label: "Rechazados", valor: rechazados }
        ];

        this.frecuenciaFallos = Object.entries(fallos).map(([label, valor]) => ({ label, valor }));

        this.tendenciaCumplimiento = Object.entries(cumplimientoPorMes).map(([mes, datos]) => ({
          label: mes,
          valor: Math.round((datos.correctos / datos.total) * 100)
        }));
        this.tendenciaCumplimiento.sort((a, b) => new Date("1 " + a.label) - new Date("1 " + b.label));

        this.distribucionFallos = Object.entries(combinaciones).map(([label, valor]) => ({ label, valor }));

      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        this.cargando = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
