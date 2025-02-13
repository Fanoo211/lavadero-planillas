<template>
  <div class="login-container">
    <div class="login">
      <img src="@/assets/logo-manfrey.png" alt="Logo Manfrey" class="logo" />
      <h1>Iniciar Sesión</h1>
      <form @submit.prevent="login">
        <div>
          <label for="username">Usuario:</label>
          <input type="text" v-model="username" required />
        </div>
        <div>
          <label for="password">Contraseña:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ isLoading ? "Cargando..." : "Ingresar" }}
        </button>
      </form>

      <!-- Mensaje de error con Bootstrap -->
      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "../store/user";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "vue-router";

export default {
  name: "LoginView",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
      isLoading: false, // Estado de carga
    };
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    return { router, userStore };
  },
  methods: {
    async login() {
      this.isLoading = true; // Activar el estado de carga
      this.errorMessage = ""; // Limpiar errores previos

      try {
        const q = query(
          collection(db, "usuarios"),
          where("username", "==", this.username)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          this.errorMessage = "Usuario no encontrado.";
          this.isLoading = false;
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const email = userData.email;
        const name = userData.name;
        const surname = userData.surname;
        const isAdmin = userData.isAdmin || false;

        await signInWithEmailAndPassword(auth, email, this.password);

        this.userStore.setUser({
          name,
          surname,
          username: this.username,
          isAdmin,
        });

        this.router.push("/home");
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        this.errorMessage =
          "Error al iniciar sesión. Inténtalo de nuevo.";
      } finally {
        this.isLoading = false; // Desactivar el estado de carga
      }
    },
  },
};
</script>

<style scoped>
/* Contenedor principal con imagen de fondo */
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: url("@/assets/fondo-login.jpeg") no-repeat center center/cover;
  padding-top: 10vh;
}

/* Overlay oscuro para oscurecer la imagen */
.login-container::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  top: 0;
  left: 0;
}

/* Estilo del formulario */
.login {
  position: relative;
  z-index: 2;
  max-width: 400px;
  padding: 1.5em;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  margin-top: 2vh;
}

/* Estilo del logo */
.logo {
  width: 150px;
  margin-bottom: 15px;
}

/* Estilo del botón */
button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
  transition: background 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

/* Estilo de inputs */
input {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Mensaje de error */
.error {
  color: red;
  font-size: 0.9em;
  margin-top: 10px;
}
</style>
