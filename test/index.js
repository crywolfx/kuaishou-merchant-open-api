const fs = require('fs');
const path = require('path');
const KsMerchantClient = require('../lib').default;

const client = new KsMerchantClient({
  appKey: 'ks683702719562282620',
  signSecret: '7482bac6555ee7a3184bcc48f4ef05cd',
  url: 'https://gw-merchant-staging.test.gifshow.com/',
  accessToken: 'ChFvYXV0aC5hY2Nlc3NUb2tlbhKAAfUu2zk0RoossjIFwNiBgM69yXS0i1IkubirqE8gN_1rA-4kw2edRD5nVo1q3mluO6qVuU7e8iJkATeIA_Q7jyXy0l77hkpDwSMnTPATN-n_lX-8DBzEA8ul0ig12EMMz0x8q3ki8UCYQ2qMOmvS_pIhsvIwwd-whssU-vB4ABqiGhJlNxcp8KRotP1YGpX0lD9hTzMiIDhtp2VaJZ6yynkldVksNU9lTHbibnEMZ8fhjK8Yye_zKA8wAQ'
});

// 商品详情获取
client.execute({ api: 'open.item.get' }, { kwaiItemId: 405050285370 }).then((res) => {
  console.log(res);
});

// 图片上传
client.execute({ api: 'open.item.image.upload' }, {
  imgUrl: 'https://kcdn.staging.kuaishou.com/bs2/image-kwaishop-product/item-2164939370-f58f545fbe404ae1848597247e8a85a1.jpg?bp=10180',
  imgBytes: fs.createReadStream(path.join(__dirname, './img.jpeg')),
  uploadType: 1,
}).then((res) => {
  console.log(res);
});

// 更新图片
client.execute({ api: 'open.item.detail.images.update' }, {
  kwaiItemId: '403005170370',
  detailImageUrls: ['https://kcdn.staging.kuaishou.com/bs2/image-kwaishop-product/item-2164939370-f48a94052e2a46e1b645d71803267cf6.jpg?bp=10180']
}).then((res) => {
  console.log(res);
})

