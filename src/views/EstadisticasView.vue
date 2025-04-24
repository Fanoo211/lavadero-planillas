<template>
  <NavbarComp :title="''" @logout="logout" />

  <div class="container mt-4">
    <!-- Filtro por mes/año -->
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
          :clearable="false"
        />
      </div>
    </div>

    <!-- Admin vs Usuario -->
    <EstadisticasAdmin v-if="authStore.isAdmin" :planillas="planillas" />
    <EstadisticasUsuario v-else :planillas="planillas" />
  </div>
</template>

<script>
import NavbarComp from "@/components/NavbarComp.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import { ref } from "vue";
import { useUserStore } from "@/store/user";
import { usePlanillas } from "@/composables/usePlanillas";

import EstadisticasAdmin from "@/components/EstadisticasAdmin.vue";
import EstadisticasUsuario from "@/components/EstadisticasUsuario.vue";

export default {
  components: {
    NavbarComp,
    VueDatePicker,
    EstadisticasAdmin,
    EstadisticasUsuario,
  },
  setup() {
    const month = ref({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });

    const { planillas } = usePlanillas(month);
    const authStore = useUserStore();

    const logout = () => {
      // lógica de cierre de sesión
    };

    return {
      month,
      planillas,
      authStore,
      logout,
    };
  },
};
</script>

<style scoped>
/* ajustes globales si hiciera falta */
</style>
