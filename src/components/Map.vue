<template>
    <div id="map" style="height: 500px;"></div>
</template>


<script setup lang="ts">
import { onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-ant-path"; // 流动线插件

onMounted(() => {
    const map = L.map("map").setView([39.9, 116.4], 13);

    // 添加底图
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // 路径坐标
    const latlngs = [
        [39.9, 116.4],
        [39.91, 116.41],
        [39.92, 116.42],
        [39.93, 116.43],
    ];

    // 流动线
    const antPath = L.polyline.antPath(latlngs, {
        delay: 400,
        dashArray: [10, 20],
        weight: 5,
        color: "#FF0000",
        pulseColor: "#FFFFFF",
    }).addTo(map);

    // 移动 marker
    const marker = L.marker(latlngs[0]).addTo(map);

    let i = 0;
    function moveMarker() {
        i++;
        if (i >= latlngs.length) i = 0; // 循环
        marker.setLatLng(latlngs[i]);
        setTimeout(moveMarker, 500);
    }
    // moveMarker();
});
</script>
