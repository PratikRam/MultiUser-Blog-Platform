import axios from "axios"

const api = axios.create({
    baseURL: "https://multiuser-blog-platform.onrender.com/api",
    // baseURL : "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//     console.log("token is : ", token);
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// }, (error) => {
//     return Promise.reject(error);
// });

export default api