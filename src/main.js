import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// Importa el componente de month‑picker
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

// 1. Crea la app y la guardas en una variable
const app = createApp(App);

// 2. Registra Pinia, el router y el componente global
app.use(createPinia()).use(router).component("VueDatePicker", VueDatePicker);

// 3. Monta la app al final
app.mount("#app");

/*
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

createApp(App).use(createPinia()).use(router).mount("#app");

app.component("VueDatePicker", VueDatePicker);
*/
