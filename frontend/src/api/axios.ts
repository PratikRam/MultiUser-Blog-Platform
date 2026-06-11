import axios from "axios"

const api = axios.create({
    baseURL: "https://multiuser-blog-platform.onrender.com/api",
    // baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default api