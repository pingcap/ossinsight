import axios from "axios";

export const BASE_URL = process.env.API_BASE

export function createHttpClient() {
  return  axios.create({
    baseURL: BASE_URL
  });
}
