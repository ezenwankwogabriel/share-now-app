import axios from "axios";

export const API =
  "https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api";

export default {
  getLocation() {
    return axios.get(`${API}/locations`).then(res => res.data);
  },

  getCars(location: string) {
    return axios.get(`${API}/vehicles/${location}`).then(res => res.data);
  }
};
