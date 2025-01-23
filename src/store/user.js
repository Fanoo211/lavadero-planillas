import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: "",
    surname: "",
    username: "",
    isAdmin: "",
  }),
  actions: {
    setUser(userData) {
      this.name = userData.name;
      this.surname = userData.surname;
      this.username = userData.username;
      this.isAdmin = userData.isAdmin;
    },
  },
});
