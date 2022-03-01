import axios from "axios";

const BASE_URL = 'https://community-preview-contributor.tidb.io'
// const BASE_URL = 'http://localhost:3450'

export function createHttpClient() {
  return  axios.create({
    baseURL: BASE_URL
  });
}
