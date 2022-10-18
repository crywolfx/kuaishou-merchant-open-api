# 快手电商开放平台openAPI

## Install
```bash
npm i kuaishou-merchant-open-api -S
```
## Usage
```typescript
import KsMerchantClient, { SignMethod } from 'kuaishou-merchant-open-api';

const client = new KsMerchantClient({
  appKey: 'appKey',
  signSecret: 'signSecret',
  accessToken: 'accessToken',
  signMethod: SignMethod.MD5,
});

// request
client.execute({ api: 'open.item.get' }, { kwaiItemId: 123456 })
.then((res) => {
  // console.log(res);
});

// upload
client.execute({ api: 'open.item.image.upload' }, {
  imgUrl: 'imgUrl',
  imgBytes: fs.createReadStream(path.join(__dirname, './img.jpeg')),
  uploadType: 1,
}).then((res) => {
  console.log(res);
});
```

## API
### constructor
|  Property   | Description | Type | Required | Default |
|  ----  | ----  | ----  | ----  | ----  |
| appKey | appId | `string` | `true` | - |
| signSecret  | sign secret  | `string` | `true` | - |
| accessToken | [授权说明](https://open.kwaixiaodian.com/docs/dev?pageSign=e1d9e229332f4f233a04b44833a5dfe71614263940720) | `string` | `true` | - |
| url | domain | `string` | `false` | https://openapi.kwaixiaodian.com | 
| signMethod | crypto | `SignMethod` | `false` | `SignMethod.MD5` |

### execute
### system params
|  Property   | Description | Type | Required | Default |
|  ----  | ----  | ----  | ----  | ----  |
| api | api path | `string` | `true` | - |
| method | request mode | `string` | `false` | `GET` / `POST` |
| version | api version | `number` | `false` | `1` |


## License
Licensed under the MIT License.