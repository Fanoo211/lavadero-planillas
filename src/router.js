import { createRouter, createWebHistory } from "vue-router";
import { auth, signOut } from "./firebase";
import LoginView from "./views/LoginView.vue";
import HomeView from "./views/HomeView.vue";
import NuevaPlanillaView from "./views/NuevaPlanillaView.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/nueva-planilla",
    name: "NuevaPlanilla",
    component: NuevaPlanillaView,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = auth.currentUser;

  if (to.meta.requiresAuth && !user) {
    next("/login");
  } else {
    next();
  }
});

window.addEventListener("beforeunload", async () => {
  if (auth.currentUser) {
    await signOut(auth);
  }
});

export default router;
