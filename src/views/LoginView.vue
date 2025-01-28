<template>
  <div class="login">
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
      <button type="submit">Ingresar</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
    };
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    return { router, userStore };
  },
  methods: {
    async login() {
      try {
        const q = query(
          collection(db, "usuarios"),
          where("username", "==", this.username)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          this.errorMessage = "Usuario no encontrado.";
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
          "Nombre de usuario o contraseña incorrectos. Inténtalo de nuevo.";
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 1em;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-top: 60px;
}

input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  font-size: 0.9em;
  margin-top: 10px;
}
</style>
