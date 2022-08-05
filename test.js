// eslint-disable-next-line @typescript-eslint/no-var-requires
const KsMerchantClient = require('./lib').default;

const client = new KsMerchantClient({ appKey: 'ks698057945834178647', signSecret: '0999d6ce9182b1b3f2cc454a6558096b', url: 'https://gw-merchant-staging.test.gifshow.com/', accessToken: 'ChFvYXV0aC5hY2Nlc3NUb2tlbhIw2X_PNucU_x8_XydoTYOKBkQ8YVDTQQC3vWfBdHUF35OhtM-FQu8vI0yNU-LJiNCEGhKxiMDMw-rDsMoxRnwv4VUtch8iIOH2BN5flsOI5BruC-6ROqBEMELI_fuZgUrfkJAu87l3KA8wAQ' });

client.execute({ api: 'open.user.sub.account.list' }).then((res) => {
  console.log(res);
})