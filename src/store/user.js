import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: "",
    surname: "",
    username: "",
    isAdmin: false, // Variable para identificar si el usuario es administrador
  }),
  actions: {
    setUser({ name, surname, username, isAdmin }) {
      this.name = name;
      this.surname = surname;
      this.username = username;
      this.isAdmin = isAdmin; // Asignar el valor de isAdmin al iniciar sesión
    },
    clearUser() {
      this.name = "";
      this.surname = "";
      this.username = "";
      this.isAdmin = false;
    },
  },
});
