import axios from "axios";

const api = axios.create({
    baseURL: 'https://api-internsync.smkpgritelagasari.sch.id',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

export default api;