<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
      <!-- Brand / Logo + Texto debajo -->
      <a
        class="navbar-brand d-flex flex-column align-items-center"
        @click="home"
        style="cursor: pointer;"
      >
        <img
          src="@/assets/logo-manfrey.png"
          alt="Logo"
          :width="logoWidth"
          class="logo mb-1"
        />
        <span class="brand-text">Lavadero de Bandejas</span>
      </a>

      <!-- Botón toggle para pantallas pequeñas -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Nav items y resto -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <!-- Nav item Estadísticas -->
          <li class="nav-item">
            <a
              class="nav-link text-white nav-estadisticas"
              @click="goToEstadisticas"
              style="cursor: pointer;"
            >
              Estadísticas
            </a>
          </li>
        </ul>

        <!-- Título centrado -->
        <span class="navbar-text mx-auto">{{ title }}</span>

        <!-- Botón Cerrar Sesión -->
        <button class="btn btn-light text-danger fw-bold" @click="logout">
          Cerrar Sesión
        </button>
      </div>
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
.custom-navbar {
  background-color: #008f39; /* Verde Manfrey */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Logo */
.logo {
  cursor: pointer;
  transition: transform 0.3s ease;
}
.logo:hover {
  transform: scale(1.1);
}

/* Texto debajo del logo */
.brand-text {
  color: white;
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.1;
  text-align: center;
}

/* Nav-link “Estadísticas” con línea naranja en hover */
.nav-estadisticas {
  position: relative;
  transition: color 0.2s ease;
}
.nav-estadisticas::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0%;
  height: 2px;
  background-color: orange;  /* #ff6900 */
  transition: width 0.3s ease;
}
.nav-estadisticas:hover {
  color: #ffd380;
}
.nav-estadisticas:hover::after {
  width: 100%;
}

/* Toggler visible sobre fondo oscuro */
.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.5);
}
.navbar-toggler-icon {
  filter: invert(1);
}

/* Botón Cerrar Sesión */
.btn-light {
  border: 2px solid #dc3545;
  transition: background 0.3s, color 0.3s;
}
.btn-light:hover {
  background-color: #dc3545;
  color: white !important;
}
</style>
