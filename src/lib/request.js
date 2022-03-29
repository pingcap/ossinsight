import axios from "axios";

export const BASE_URL = 'https://api.ossinsight.io'
// export const BASE_URL = 'http://localhost:3450'

export function createHttpClient() {
  return  axios.create({
    baseURL: BASE_URL
  });
}
