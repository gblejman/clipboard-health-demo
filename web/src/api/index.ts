import axios from "axios";
import config from "../config";
import { Shift } from "../types";

const client = axios.create({
  baseURL: config.api.url,
  timeout: config.api.timeout,
});

client.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.log("req error", { error });
    return Promise.reject(error.response.data);
  }
);

client.interceptors.response.use(
  (response) => {
    return response.data.data;
  },
  (error) => {
    console.log("res error", { error });
    return Promise.reject(error.response.data);
  }
);

const api = {
  shifts: {
    find: ({ workerId }: { workerId: number }) =>
      client.request<Shift[]>({
        method: "get",
        url: "/shifts",
        params: { workerId },
      }),
  },
};

export default api;
