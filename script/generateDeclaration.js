const { writeFileSync } = require('fs');
const path = require('path');
const asyncPool = require('tiny-async-pool');
const axios = require('axios').default;
const { compile } = require('json-schema-to-typescript');
const colors = require('colors/safe');
const log = require('./log');

const service = axios.create({
  baseURL: 'https://open.kwaixiaodian.com',
  headers: {
    'request-source': 'kuaishou-merchant-node-open-api',
    'Referer': 'https://open.kwaixiaodian.com/docs/api',
    'Host': 'open.kwaixiaodian.com',
    'kpf': 'PC_WEB',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
  },
});

const isArrayType = (paramType = '') => {
  const listMatch = /^List<.+>$/i;
  const listMatch2 = /.+\[\]$/;
  return !!(paramType.match(listMatch) || paramType.match(listMatch2));
};

const replaceArrayType = (paramType = '') => {
  const newStr = paramType + '';
  const listMatch = /^List</i;
  const listMatch2 = /(\[\]$)|(>$)/;
  return newStr.replace(listMatch, '')?.replace?.(listMatch2, '');
};

const basicTypeConvert = (type = '') => {
  const lowerCaseType = type.toLocaleLowerCase() || 'unknow';
  let newBasicType = lowerCaseType;
  let tsType;
  if (lowerCaseType === 'number' || lowerCaseType === 'long' || lowerCaseType === 'integer' || lowerCaseType === 'double' || lowerCaseType === 'float') newBasicType = 'number';
  if (lowerCaseType === 'map') {
    newBasicType === 'object';
    tsType = 'Record<string, any>';
  }
  if (lowerCaseType === 'date') {
    newBasicType === 'object';
    tsType = 'Date|number';
  }
  if (lowerCaseType === 'bytes') {
    newBasicType === 'object';
    tsType = 'NodeJS.ReadableStream|Buffer'
  }
  const data = {
    type: newBasicType,
  };
  tsType && (data.tsType = tsType);
  return data;
}

service.interceptors.response.use(res => {
  if (res && res.status === 200 && res.data && res.data.status === 200) return res.data.data;
  return Promise.reject(res);
}, res => res?.response?.data);

const getApiList = () => {
  return service.request({
    url: '/rest/open/platform/doc/api/category/list',
    method: 'GET',
  }).then((data = []) => {
    return data.reduce((pre, current) => {
      return pre.concat(current.items || []);
    }, [])
  })
}

const getSturcture = (params) => {
  return service.request({
    url: '/rest/open/platform/doc/structure/detail',
    method: 'GET',
    params
  }).then((data) => {
    if (data.errorMsg && !data.params) return Promise.reject(data);
    return data.params || [];
  })
}

const formatParams = (params = [], parentStructureId) => {
  return Promise.resolve(params).then((paramsList) => {
    return paramsList.reduce((pre, current = {}) => {
      const { paramName, paramType, description, structureId, required } = current;
      const isArray = isArrayType(paramType);
      const paramTypeWithoutArray = replaceArrayType(paramType);
      const isStructure = !!structureId;
      return pre.then(async (res) => {
        if (required) {
          res.required = [...(res.required || []), paramName];
        }
        // 基本类型
        if (!isStructure && !isArray) return {
          properties: {
            ...(res.properties || {}),
            [paramName]: {
              ...basicTypeConvert(paramTypeWithoutArray),
              description: description,
            },
          },
          required: res.required,
        }

        const type = isArray ? 'array' : 'object';
        let childrenSchema;
        // 基本类型数组
        if (!isStructure) {
          childrenSchema = {
            items: { ...basicTypeConvert(paramTypeWithoutArray) }
          }
        } else {
          log.info(`开始获取结构体${paramTypeWithoutArray}`);
          let properties;
          if (parentStructureId === structureId) {
            res.properties[paramName] = res.properties;
            properties = { properties: res.properties, required: res.required }
          } else {
            properties = await formatParams(getSturcture({ id: structureId }).catch(() => {
              log.error(`结构体${paramTypeWithoutArray}获取失败`);
              return Promise.resolve([]);
            }), structureId);
            log.success(`结构体${paramTypeWithoutArray}获取成功`);
          }
          childrenSchema = isArray ? {
            items: {
              type: 'object',
              ...properties
            }
          } : {
            ...properties,
          }
        }
        return {
          properties: {
            ...(res.properties || {}),
            [paramName]: {
              type,
              description,
              ...childrenSchema,
            }
          },
          required: res.required,
        }
      })
    }, Promise.resolve({ properties: {}, required: [] }))
  });
}

let count = 0;
let current = 0;
const getApiInfo = (params) => {
  const percent = parseInt((++current / count) * 10000) / 100;
  console.log('生成进度:', colors.yellow(`${percent}%`));
  console.log('当前参数:', params)
  return service.request({
    url: '/rest/open/platform/doc/api/name/detail',
    method: 'GET',
    params
  }).then(async (data) => {
    const { name, inputParams = [], outputParams = [], cnName, description } = data || {};
    const hasInput = inputParams.length > 0;
    const hasOutput = outputParams.length > 0;
    return { name, inputParams: await formatParams(inputParams), outputParams: await formatParams(outputParams), cnName, description, hasInput, hasOutput };
  })
}

const asyncPoolAll = async (...args) => {
  const results = [];
  for await (const result of asyncPool(...args)) {
    results.push(result);
  }
  return results;
}

const getApiInfoList = async () => {
  const apiList = await getApiList();
  const params = apiList.map((item) => ({ name: item.name, version: item.version }));
  count = params.length;
  log.success(`共${count}个API`);
  return asyncPoolAll(4, params, getApiInfo);
}

const declaration = async (apiListInfo = []) => {
  log.success('开始生成declaration');
  const schema = apiListInfo.reduce((pre, current) => {
    const { name, cnName, hasInput, hasOutput, inputParams, outputParams } = current || {};
    pre.required.push(name);
    pre.properties[name] = {
      type: 'object',
      description: cnName,
      properties: {
        request: {
          type: 'object',
          description: 'API入参',
          ...inputParams
        },
        response: {
          type: 'object',
          description: 'API出参',
          ...outputParams
        },
      },
      required: [hasInput && 'request', hasOutput && 'response'].filter(Boolean)
    }
    return pre;
  }, { properties: {}, required: [] });
  const ApiDeclaration = {
    title: 'ApiDeclaration',
    type: 'object',
    additionalProperties: false,
    ...schema
  };
  const declaration = await compile(ApiDeclaration);
  log.success('开始写入declaration');
  writeFileSync(path.join(__dirname, '../packages/common/interface/api.declaration.ts'), declaration);
  log.success('declaration写入成功');
}

(async () => {
  declaration(await getApiInfoList());
})();
