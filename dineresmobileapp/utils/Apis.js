import axios from "axios";
import { BASE_URL } from "@env";

export const endpoints = {
  "categories": "/categories/",
  "dishes": "/dishes/",
  "dish-detail": (dishId) => `/dishes/${dishId}/`,
  "register": "/users/",
  "login": "/o/token/",
  "refresh-login": "/o/refresh/",
  "current-user": "/users/current-user/",
  "user-notify": "/notifications/"
};

export const authApis = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
