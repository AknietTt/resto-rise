// utils/auth.ts
import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1 }); // Устанавливаем токен на 1 день
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};


export const getUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};
