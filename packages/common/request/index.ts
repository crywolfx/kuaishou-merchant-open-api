import axios from 'axios';

const request = axios.create({
  headers: {
    'request-source': 'kuaishou-merchant-node-open-api'
  },
  // paramsSerializer (params) {
  //   return new URLSearchParams(params).toString();
  // },
});

request.interceptors.response.use(res => res.data, res => res?.response?.data);

export default request;