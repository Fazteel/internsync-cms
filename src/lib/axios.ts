import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://api-internsync.smkpgritelagasari.sch.id'),
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

export default api;