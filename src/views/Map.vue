<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/images/share-now-logo.png" />
    <el-select
      v-model="city"
      placeholder="Select City"
      class="location-selector"
      @change="onCityChange"
    >
      <el-option
        v-for="(location, id) in locations"
        :key="id"
        :label="location.name"
        :value="location.id"
      >
      </el-option>
    </el-select>

    <el-button
      @click="drawer = true"
      class="drawer"
      icon="el-icon-s-unfold"
    ></el-button>

    <div data-testid="map" class="sidebar-map map" id="map"></div>

    <el-drawer
      title="Filter"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <div class="section">
        <label for="" class="label">Filter By Fuel Level</label>
        <div class="filter">
          <el-slider
            v-model="fuelLevel"
            :min="0"
            :max="1"
            :step="0.1"
          ></el-slider>
        </div>
        <div>
          <el-button type="primary" @click="filterCars('fuel')"
            >Filter</el-button
          >
        </div>
      </div>

      <div class="section">
        <label for="" class="label">Filter By Car Model</label>
        <div class="car-models">
          <el-select v-model="model" placeholder="Select">
            <el-option
              v-for="(car, id) in Object.keys(carModels)"
              :key="id"
              :label="car"
              :value="car"
            >
            </el-option>
          </el-select>
        </div>
        <div>
          <el-button type="primary" @click="filterCars('cars')"
            >Filter</el-button
          >
        </div>
      </div>

      <div class="clear-filter">
        <el-button @click="filterCars()">Clear Filter</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import L, { Map, Marker } from "leaflet";
import mapApi from "../apis";

interface Location {
  latitude: number;
  longitude: number;
}

interface Provider {
  name: string;
  mapSection: { center: Location };
}

interface LayerGroup {
  [name: string]: L.LayerGroup;
}

interface Car {
  position: { latitude: number; longitude: number };
  model: string;
  numberPlate: string;
  vin: string;
  fuel: number;
}

interface CarModels {
  [name: string]: number;
}

export default Vue.extend({
  name: "Home",
  components: {},
  data: () => ({
    locations: [] as Array<Provider>,
    map: null as Map | null,
    polling: -1 as number,
    layerGroup: {} as LayerGroup,
    timeout: 600000 as number,
    carModelCount: 1 as number,
    drawer: false as boolean,
    direction: "ltr" as string,
    carModels: {} as CarModels,
    model: "" as string,
    city: (null as unknown) as number,
    fuelLevel: 0 as number,
    filterByModel: false as boolean,
    filterByGuage: false as boolean
  }),
  mounted() {
    this.map = L.map("map", {
      center: [51.5, 9.97],
      zoom: 5,
      doubleClickZoom: false,
      layers: [
        L.tileLayer(
          "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
          }
        )
      ]
    });

    this.fetchCarsOnInterval();
  },
  beforeDestroy() {
    this.clearPolling();
  },
  methods: {
    async fetchDetails(map: Map) {
      try {
        const locations = await mapApi.getLocation();
        this.locations = locations.data;
        this.carModelCount = 1;

        for (const location of this.locations) {
          await this.addCarsToMap(location.name, map);
        }
      } catch (ex) {
        console.log(ex);
      }
    },

    async addCarsToMap(locationName: string, map: Map) {
      try {
        const layers: Marker[] = [];

        const cars = await mapApi.getCars(locationName);

        cars.data.forEach((car: Car): void => {
          const {
            model,
            numberPlate,
            vin,
            fuel,
            position: { latitude, longitude }
          } = car;
          const popupDetail = `
            <p>model: ${model}</p>
            <p>numberPlate: ${numberPlate}</p>
            <p>vin: ${vin}</p>
            <p>location: latitude: ${latitude}, longitude: ${longitude}</p>
          `;

          if (!this.carModels[model]) {
            this.carModels[model] = this.carModelCount++;
          }

          if (this.filterByModel && this.model && model !== this.model) return;
          if (this.filterByGuage && fuel !== this.fuelLevel) return;

          if (this.layerGroup[locationName]) {
            this.layerGroup[locationName].clearLayers();
            delete this.layerGroup[locationName];
          }

          const marker1 = L.marker([latitude, longitude], {
            icon: this.getIcon(this.carModels[model], "car")
          })
            .bindPopup(popupDetail, { closeButton: true })
            .on("click", (e: L.LeafletMouseEvent) => map.setView(e.latlng, 13));

          const marker2 = L.marker([latitude, longitude], {
            icon: this.getPicker(this.carModels[model], fuel)
          }).on("click", (e: L.LeafletMouseEvent) => map.setView(e.latlng, 13));

          layers.push(...[marker1, marker2]);
        });

        this.layerGroup[locationName] = L.layerGroup(layers).addTo(map);
      } catch (ex) {
        console.log(ex);
      }
    },

    fetchCarsOnInterval() {
      if (!this.map) return;

      this.clearPolling();

      const map: Map = this.map;

      this.fetchDetails(map);
      this.polling = setInterval(() => {
        this.fetchDetails(map);
      }, this.timeout);
    },

    getIcon(index: number, type: string) {
      if (index > 10) {
        index = 1;
      }

      const iconSize: [number, number] = type === "car" ? [100, 100] : [20, 30];

      return L.icon({
        iconRetinaUrl: require(`../assets/images/${type}${index}.png`),
        iconUrl: require(`../assets/images/${type}${index}.png`),
        shadowSize: [0, 0],
        iconSize: iconSize
      });
    },

    getPicker(index: number, guage: number) {
      const imagePath =
        "https://unpkg.com/@googlemaps/markerclustererplus@1.0.3/images/";
      return L.divIcon({
        className: "my-div-class",
        html: `
          <div class="my-car-pin">
            <img width="52px" height="52px" src="${imagePath}m${index}.png"/>
            <div class="my-car-guage">
              <span class="my-div-span">${guage * 100}%</span>
            </div>
          </div>
        `
      });
    },

    onCityChange() {
      if (this.city < 1) return;

      const targetLocation = this.locations[this.city - 1];

      if (targetLocation && this.map) {
        const {
          mapSection: { center }
        } = targetLocation;

        this.map.setView(L.latLng(center.latitude, center.longitude), 10);
      }
    },

    filterCars(type: string) {
      if (type === "fuel") {
        this.filterByGuage = true;
      } else if (type === "cars") {
        this.filterByModel = true;
      } else {
        this.filterByModel = false;
        this.filterByGuage = false;
        this.model = "";
        this.fuelLevel = 0;
      }

      this.fetchCarsOnInterval();
    },

    clearLayers(): void {
      Object.keys(this.layerGroup).forEach(locationName => {
        this.layerGroup[locationName].clearLayers();
        delete this.layerGroup[locationName];
      });
    },

    handleClose() {
      this.drawer = false;
    },

    clearPolling() {
      if (this.polling > -1) {
        clearInterval(this.polling);
        this.polling = -1;
      }
    }
  }
});
</script>

<style lang="scss" src="../assets/css/map.scss"></style>
<style lang="css" src="leaflet/dist/leaflet.css"></style>
