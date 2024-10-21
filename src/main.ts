import { createApp } from "vue";
import App from "./App.vue";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { mdi } from "vuetify/lib/iconsets/mdi.mjs";
import "@mdi/font/css/materialdesignicons.css";

const vuetify = createVuetify({
    icons: {
        defaultSet: "mdi",
        sets: { mdi },
    },
});
const app = createApp(App);
app.use(vuetify);
app.mount("#app");
