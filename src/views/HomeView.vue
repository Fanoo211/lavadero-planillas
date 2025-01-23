<template>
  <div>
    <!-- Navbar -->
    <NavbarComp :title="'Lavadero de Bandejas'" @logout="logout" />

    <!-- Main -->
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-12 text-center">
          <!-- Mostrar mensaje de bienvenida -->
          <h2 class="welcome-message">
            Bienvenido, {{ userStore.name }} {{ userStore.surname }}
          </h2>
        </div>
        <div class="col-4">
          <div class="card text-center shadow" @click="nuevaPlanilla">
            <div class="card-body">
              <h3 class="card-title">+</h3>
              <p class="card-text">Nueva Planilla</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavbarComp from "@/components/NavbarComp.vue";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/user";

export default {
  name: "HomeView",
  components: {
    NavbarComp,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const logout = async () => {
      await signOut(auth);
      router.push("/");
    };

    const nuevaPlanilla = () => {
      router.push("/nueva-planilla");
    };

    return { logout, nuevaPlanilla, userStore };
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

.welcome-message {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeIn 1s forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
