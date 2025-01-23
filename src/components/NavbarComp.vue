<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" @click="home">
        <img
          src="@/assets/logo-manfrey.png"
          alt="Logo"
          :width="logoWidth"
          class="logo"
        />
      </a>
      <span class="navbar-text mx-auto">{{ title }}</span>
      <button class="btn btn-danger" @click="logout">Cerrar Sesión</button>
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

    return { logout, home };
  },
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}
</style>
