<script setup>
import { ref, onMounted, watch } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import "leaflet-control-geocoder"

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [24.7136, 46.6753] 
  }
})

const emit = defineEmits(["update:modelValue", "notify"])

let map = null
let marker = null
const markerPosition = ref([...props.modelValue])

watch(markerPosition, (newVal) => {
  emit("update:modelValue", newVal)
})

onMounted(() => {
  // Layers
  const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
  )
  const streetsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: '© OpenStreetMap contributors', maxZoom: 19 }
  )
  const labelsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: '© OpenStreetMap contributors', maxZoom: 19, opacity: 0.3 }
  )

  // Init Map
  map = L.map("map", { 
    layers: [satelliteLayer],
    maxZoom: 19
  }).setView(markerPosition.value, 19)

  // Hybrid layer
  const hybridLayer = L.layerGroup([satelliteLayer, labelsLayer])

  // Layer control
  L.control.layers(
    { "Satellite": satelliteLayer, "Streets": streetsLayer, "Hybrid": hybridLayer },
    null,
    { position: "bottomright" }
  ).addTo(map)

  // Marker 
  const customIcon = L.divIcon({
    html: `<i class="fa-solid fa-location-dot" style="font-size:24px; color:red;"></i>`,
    className: "custom-fa-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  })

  marker = L.marker(markerPosition.value, { draggable: true, icon: customIcon }).addTo(map)

  // Drag Marker
  marker.on("dragend", (e) => {
    const pos = e.target.getLatLng()
    markerPosition.value = [pos.lat, pos.lng]
    reverseGeocode(pos)
  })

  // Click on map
  map.on("click", (e) => {
    const pos = e.latlng
    marker.setLatLng(pos)
    markerPosition.value = [pos.lat, pos.lng]
    reverseGeocode(pos)
  })

  // Search
  L.Control.geocoder({ defaultMarkGeocode: false })
    .on("markgeocode", (e) => {
      const center = e.geocode.center
      const name = e.geocode.name
      map.setView(center, 16)
      marker.setLatLng(center)
      marker.bindPopup(name).openPopup()
      markerPosition.value = [center.lat, center.lng]
    })
    .addTo(map)

  const locateControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      const btn = L.DomUtil.create("button", "leaflet-bar")
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i>`
      btn.style.background = "white"
      btn.style.width = "34px"
      btn.style.height = "34px"
      btn.style.cursor = "pointer"
      btn.style.fontSize = "18px"

      L.DomEvent.disableClickPropagation(btn)
      L.DomEvent.disableScrollPropagation(btn)

      btn.onclick = function () {
        locateUser() 
      }

      return btn
    }
  })
  map.addControl(new locateControl())
})

// Reverse Geocoding
function reverseGeocode(pos) {
  if (L.Control.Geocoder && L.Control.Geocoder.nominatim) {
    const geocoder = L.Control.Geocoder.nominatim()
    geocoder.reverse(pos, map.getZoom(), (results) => {
      if (results && results.length > 0) {
        const name = results[0].name
        marker.bindPopup(name).openPopup()
      }
    })
  }
}

function locateUser() {
  if (!map) return

  map.locate({ setView: true, maxZoom: 16 })

  map.once("locationfound", (e) => {
    const pos = e.latlng
    marker.setLatLng(pos)
    markerPosition.value = [pos.lat, pos.lng]
    reverseGeocode(pos)
  })

  map.once("locationerror", () => {
    emit("notify", "لتحديد الموقع تلقائيا يرجى منح الاذن باستخدام موقعك")
  })
}
</script>

<template>
  <div>
    <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
    <div class="coordinates">
      إحداثيات الموقع المختار:
      {{ markerPosition[0].toFixed(5) }}, {{ markerPosition[1].toFixed(5) }}
    </div>
  </div>
</template>

<style>
.coordinates {
  color: #fff;
  padding-top: 10px;
  font-size: 18px;
}
</style>
