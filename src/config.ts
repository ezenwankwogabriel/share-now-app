import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const API =
  "https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api/";

export const Axios = axios.create({
  baseURL: API
});

Axios.interceptors.request.use(
  function(config: AxiosRequestConfig) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
Axios.interceptors.response.use(
  function(response: AxiosResponse) {
    return response.data;
  },
  function(error) {
    return error;
  }
);
