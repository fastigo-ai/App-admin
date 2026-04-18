import axios from 'axios';

const api = axios.create({
  baseURL: 'https://engineerbackendapp-sxote.ondigitalocean.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
