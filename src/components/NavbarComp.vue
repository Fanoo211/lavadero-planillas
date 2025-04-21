<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" @click="home">
        <img
          src="@/assets/logo-manfrey.png"
          alt="Logo"
          :width="logoWidth"
          class="logo"
        />
      </a>

      <!-- Enlace a Estadísticas -->
      <a class="nav-link text-white ms-3" @click="goToEstadisticas" style="cursor: pointer;">
        Estadísticas
      </a>

      <span class="navbar-text mx-auto">{{ title }}</span>

      <button class="btn btn-light text-danger fw-bold" @click="logout">
        Cerrar Sesión
      </button>
    </div>
  </nav>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "NavbarComp",
  props: {
    title: {
      type: String,
      required: true,
    },
    logoWidth: {
      type: Number,
      default: 100,
    },
  },
  emits: ["logout"],
  setup(_, { emit }) {
    const router = useRouter();

    const logout = () => {
      emit("logout");
    };

    const home = () => {
      router.push("/home");
    };

    const goToEstadisticas = () => {
      router.push("/estadisticas");
    };

    return { logout, home, goToEstadisticas };
  },
};
</script>


<style scoped>
/* Color verde personalizado similar al logo de Manfrey */
.custom-navbar {
  background-color: #008f39; /* Verde Manfrey */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Color de texto para contraste */
.navbar-text {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Estilo del logo */
.logo {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}

/* Botón de cerrar sesión */
.btn-light {
  border: 2px solid #dc3545;
  transition: background 0.3s, color 0.3s;
}

.btn-light:hover {
  background-color: #dc3545;
  color: white !important;
}
</style>
