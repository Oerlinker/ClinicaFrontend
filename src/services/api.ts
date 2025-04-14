import axios from "axios";

const API_URL= process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const API = axios.create({
    baseURL: API_URL,
});

API.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem("token");

        if (!token) {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user && user.token) {
                        token = user.token;
                    }
                } catch (e) {
                    console.error("Error al leer usuario desde localStorage", e);
                }
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;
