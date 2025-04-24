// src/composables/usePlanillas.js
import { ref, watch } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { useUserStore } from "@/store/user";

export function usePlanillas(month) {
  const planillas = ref([]);
  const authStore = useUserStore();

  const cargarPlanillas = async () => {
    const snapshot = await getDocs(collection(db, "planillas"));
    let todas = snapshot.docs.map((doc) => doc.data());

    // Filtrar por mes y año seleccionado (UTC)
    const sel = new Date(month.value.year, month.value.month, 1);
    todas = todas.filter((p) => {
      const d = new Date(p.fecha);
      return (
        d.getUTCFullYear() === sel.getUTCFullYear() &&
        d.getUTCMonth() === sel.getUTCMonth()
      );
    });

    // Si no es admin, filtrar solo las propias
    if (!authStore.isAdmin) {
      const email = getAuth().currentUser?.email || "";
      todas = todas.filter((p) => p.usuario?.email === email);
    }

    planillas.value = todas;
  };

  watch(month, cargarPlanillas, { deep: true, immediate: true });

  return { planillas };
}
