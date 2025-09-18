<script setup>
import { onMounted } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const props = defineProps({
  coords: {
    type: Array,
    required: true
  }
})

const mapDivId = `map-${Math.random().toString(36).substr(2, 9)}`

onMounted(() => {
  const map = L.map(mapDivId, { maxZoom: 19, zoomControl: true }).setView(props.coords, 16)

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
  ).addTo(map)

  const customIcon = L.divIcon({
    html: `<i class="fa-solid fa-location-dot" style="font-size:22px; color:red;"></i>`,
    className: "custom-fa-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 22]
  })

  L.marker(props.coords, { draggable: false, icon: customIcon }).addTo(map)
})
</script>

<template>
  <div :id="mapDivId" style="height: 300px; width: 100%; border-radius: 8px;"></div>
</template>
