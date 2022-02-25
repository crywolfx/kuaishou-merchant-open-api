import axios from 'axios';

const request = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  paramsSerializer (params) {
    return new URLSearchParams(params).toString();
  }
});

request.interceptors.response.use(function (res) {
  return res.data;
});


export default request;