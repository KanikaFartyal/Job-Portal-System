import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export const registerUser = (payload) => API.post('/auth/register', payload);
export const loginUser = (payload) => API.post('/auth/login', payload);
export const verifyEmail = (payload) => API.post('/auth/verify-email', payload);
export const resendVerification = (payload) => API.post('/auth/resend-verification', payload);
export const fetchJobs = (params = {}) => API.get('/jobs', { params });
export const fetchJobDetail = (jobId) => API.get(`/jobs/${jobId}`);
export const saveJob = (jobId) => API.put(`/jobs/save/${jobId}`);
export const fetchMySavedJobs = () => API.get('/jobs/saved');
export const fetchAppliedJobs = () => API.get('/jobs/applied');
export const fetchStats = () => API.get('/jobs/stats');
export const fetchMyJobs = () => API.get('/jobs/mine');
export const postJob = (payload) => API.post('/jobs', payload);
export const updateJob = (jobId, payload) => API.put(`/jobs/${jobId}`, payload);
export const deleteJob = (jobId) => API.delete(`/jobs/${jobId}`);
export const applyJob = (jobId) => API.put(`/jobs/apply/${jobId}`);
export const fetchApplicants = (jobId) => API.get(`/jobs/${jobId}/applicants`);
export const fetchNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.put('/notifications/read-all');
export const fetchProfile = () => API.get('/profile/me');
export const updateProfile = (payload) => API.put('/profile/me', payload);
export const addEducation = (payload) => API.post('/profile/education', payload);
export const updateEducation = (educationId, payload) => API.put(`/profile/education/${educationId}`, payload);
export const deleteEducation = (educationId) => API.delete(`/profile/education/${educationId}`);
