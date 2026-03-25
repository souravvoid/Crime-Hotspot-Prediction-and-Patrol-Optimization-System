import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getHotspots = () => api.get('/hotspots');
export const computeHotspots = () => api.post('/hotspots/compute');
export const getHotspotNeighbors = (areaId, depth = 1) => api.get(`/hotspots/${areaId}?depth=${depth}`);
export const getCrimes = () => api.get('/crimes');
export const createCrime = (crime) => api.post('/crimes', crime);
export const getAreas = () => api.get('/areas');
export const getPatrolUnits = () => api.get('/patrol-units');
export const getPatrolAssignments = () => api.get('/patrol/assignments');
export const assignPatrols = () => api.post('/patrol/assign');
