import { Axios } from "../config";

export default {
  getLocation() {
    return Axios.get("locations");
  },

  getCars(location: string) {
    return Axios.get(`vehicles/${location}`);
  }
};
