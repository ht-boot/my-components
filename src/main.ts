import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "leaflet/dist/leaflet.css"; // 引入leaflet样式
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus); // 使用element-plus
app.mount("#app");
