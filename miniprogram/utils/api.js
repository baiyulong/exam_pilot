const app = getApp();

const BASE_URL = 'http://localhost:3000';

function request(url, method, data, header = {}) {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token || wx.getStorageSync('token');
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header,
      },
      success(res) {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          app.globalData.token = null;
          app.login().then(() => {
            request(url, method, data, header).then(resolve).catch(reject);
          }).catch(reject);
          return;
        }
        resolve(res.data);
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

module.exports = {
  get(url, data) {
    return request(url, 'GET', data);
  },
  post(url, data) {
    return request(url, 'POST', data);
  },
  put(url, data) {
    return request(url, 'PUT', data);
  },
  del(url, data) {
    return request(url, 'DELETE', data);
  },

  // 文件上传
  uploadFile(url, filePath, formData = {}) {
    return new Promise((resolve, reject) => {
      const token = app.globalData.token || wx.getStorageSync('token');
      wx.uploadFile({
        url: BASE_URL + url,
        filePath,
        name: 'file',
        formData,
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        success(res) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            reject(new Error('解析响应失败'));
          }
        },
        fail: reject,
      });
    });
  },
};
