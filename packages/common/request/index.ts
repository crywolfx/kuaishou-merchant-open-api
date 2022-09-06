import axios from 'axios';

const service = axios.create({
  headers: {
    'request-source': 'kuaishou-merchant-node-open-api'
  },
});

service.interceptors.response.use(res => res.data, res => res?.response?.data);

export default service;