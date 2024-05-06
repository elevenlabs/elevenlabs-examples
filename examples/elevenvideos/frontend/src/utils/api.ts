import axios from "axios";
import { VITE_API_URL } from "./config.ts";

export const api = axios.create({
  baseURL: VITE_API_URL,
});
