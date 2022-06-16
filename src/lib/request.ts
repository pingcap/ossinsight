import axios from "axios";

export const BASE_URL = 'https://api.ossinsight.io'

export function createHttpClient() {
  return  axios.create({
    baseURL: BASE_URL
  });
}
