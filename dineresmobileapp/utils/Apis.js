import axios from "axios";
import { BASE_URL } from "@env";

export const endpoints = {
  "categories": "/categories/",
  "dishes": "/dishes/",
  "dish-detail": (dishId) => `/dishes/${dishId}/`,
  "dish-reviews": (dishId) => `/dishes/${dishId}/reviews/`,
  "ingredients": "/ingredients/",

  "register": "/users/",
  "login": "/o/token/",
  "users": "/users/",
  "refresh-login": "/o/refresh/",
  "current-user": "/users/current-user/",
  "change-password": "/users/change-password/",
  "apply-chef": "/users/apply-chef/",
  "user-notify": "/notifications/",
  "tables": "/tables/",
  "orders": "/orders/",
  "bookings": "/bookings/",
  "orders": "/orders/",
  "done-order": (orderId) => `/orders/${orderId}/done/`,
  "cancel-order": (orderId) => `/orders/${orderId}/cancel/`,
  "order-detail": (orderId) => `/orders/${orderId}/`,
  "user-orders": "/users/orders/",
  "payments": "/payments/",
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
