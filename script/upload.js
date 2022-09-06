const FormData = require('form-data');
const axios = require('axios');

const cdnConfig = {
  domain: 'https://kcdn.corp.kuaishou.com',
  api: '/api/kcdn/v1/service/npmUpload/single',
  multiApi: '/api/kcdn/v1/service/npmUpload/multiple',
  pid: 'shop-open-platform',
  token: '10684_b25ff92118bde79052537b4f695eccf4',
};

const request = axios.create({
  timeout: 200000,
});

class Uploader {
  constructor({ token, pid, allowRewrite, allowHash, dirName = '' } = {}) {
    this.token = token || cdnConfig.token;
    this.pid = pid || cdnConfig.pid;
    this.allowRewrite = allowRewrite || false;
    this.allowHash = allowHash || false;
    this.domain = cdnConfig.domain;
    this.api = cdnConfig.api;
    this.multiApi = cdnConfig.multiApi;
    this.dirName = dirName || '';
  }

  createData({
    pid = this.pid,
    allowHash = this.allowHash,
    allowRewrite = this.allowRewrite,
  } = {}) {
    const formData = new FormData();

    formData.append('pid', pid);
    formData.append('allowRewrite', allowRewrite + '');
    formData.append('allowHash', allowHash + '');
    return formData;
  }

  upload({ file, dirName = '', fileOptions, allowRewrite = this.allowRewrite }) {
    const requestUrl = `${this.domain}${this.api}?token=${this.token}`;
    const fileName = `${this.dirName ? this.dirName + '/' : ''}${dirName}`;
    const formData = this.createData({ allowRewrite });
    formData.append('file', file, fileOptions);
    formData.append('filename', fileName);
    return this.request(requestUrl, formData);
  }

  uploadMulti({ files, dirName = '', allowRewrite = this.allowRewrite }) {
    const requestUrl = `${this.domain}${this.multiApi}?token=${this.token}`;
    const formData = this.createData({ allowRewrite });
    const dirname = `${this.dirName ? this.dirName + '/' : ''}${dirName}`;
    formData.append('dir', dirname);
    files.forEach((file) => {
      formData.append('files[]', file.buffer, file.fileOptions);
    });
    return this.request(requestUrl, formData);
  }

  request(url, data) {
    return request
      .post(url, data, {
        headers: {
          ...data.getHeaders(),
        },
      })
      .then((res) => {
        if (res?.data?.data) {
          return res.data.data;
        }
        throw (res && res.data && res.data.data) || '上传失败';
      });
  }
}

module.exports = Uploader;
