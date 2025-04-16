import axios from 'axios';

const API_URL = 'http://localhost:8787/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}); 