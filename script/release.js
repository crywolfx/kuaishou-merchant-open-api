#!/usr/bin/env node
const { writeFileSync, createReadStream } = require('fs');
const { spawn } = require('child_process');
const readline = require('readline');
const AdmZip = require('adm-zip');
const semver = require('semver');
const colors = require('colors/safe');
const path = require('path');
const package = require('../package.json');
const Uploader = require('./upload');
const log = require('./log');
const generateDeclaration = require('./generateDeclaration');

const version = package.version;

const uploader = new Uploader({ dirName: '/open-api' });

const isFunction = (val) => Object.prototype.toString.call(val) === '[object Function]'

const runSpawn = (...command) => {
  return new Promise((resolve, reject) => {
    const ls = spawn(...command);
    const resultBufList = [];
    const errorBufList = [];
    ls.stdout.on('data', (data) => {
      resultBufList.push(data);
      log.info(data.toString());
    });

    ls.stderr.on('data', (data) => {
      errorBufList.push(data);
      log.error(data.toString());
    });

    ls.on('close', (code) => {
      const resultStr = resultBufList.map((item) => item.toString()).join('\n');
      const errorStr = errorBufList.map((item) => item.toString()).join('\n');
      if (code === 0) {
        resolve(resultStr);
      } else {
        reject(errorStr);
      }
    });
  });
};

const createReadLine = (questionList = [], {
  readLineInterface,
  isSub = false, 
  resolve,
  onFallback,
} = {}) => {
  questionList = questionList.filter(Boolean);
  const _readLineInterface =
    readLineInterface ||
    readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  _readLineInterface.on('close', () => {
    process.exit(0);
  });
  const setQuestion = (i = 0, lastResult) => {
    const item = questionList[i];
    if (item.question && item.callback) {
      _readLineInterface.question(item.question, (answer) => {
        item.callback(answer, {
          readLineInterface: _readLineInterface,
          lastResult,
          done: (nextResult) => {
            if (i === questionList.length - 1) {
              if (!isSub) {
                return _readLineInterface.close();
              } else {
                return resolve && resolve();
              }
            }
            if (i < questionList.length) return setQuestion(++i, nextResult);
          },
          go: (targetIndex, nextResult) => {
            setQuestion(targetIndex, nextResult);
          },
          close: () => {
            return _readLineInterface.close();
          },
          retry: () => {
            return setQuestion(i);
          },
          createSubQuestion: (subQuestionList = []) => {
            if (subQuestionList.length) {
              return new Promise((resolve) => {
                createReadLine(subQuestionList, {
                  readLineInterface: _readLineInterface,
                  isSub: true,
                  resolve
                });
              });
            }
            return Promise.resolve();
          },
          backTop: () => {
            if (isSub) {
              resolve && resolve();
            }
          },
          fallback: (callback) => {
            isFunction(callback) && callback();
            isFunction(onFallback) && onFallback();
            return _readLineInterface.close();
          }
        });
      });
    }
  };
  setQuestion();
};


const checkReadLine = (answer, defaultValue, yesCallback, noCallback, otherCallback) => {
  answer = answer || defaultValue;
  const answerToLowerCase = answer.toLowerCase().trim();
  if (answerToLowerCase === 'y' || answerToLowerCase === 'yes') {
    yesCallback && yesCallback();
  } else if (answerToLowerCase === 'n' || answerToLowerCase === 'no') {
    noCallback && noCallback();
  } else {
    otherCallback && otherCallback();
  }
};

const install = () => runSpawn('yarn', ['install']);
const buildNpm = () => runSpawn('yarn', ['build:npm']);
const npmPublish = () => runSpawn('npm', ['publish']);
const buildDist = () => runSpawn('yarn', ['build:dist']);
const writeVersion = (version) => {
  package.version = version;
  writeFileSync(path.join(__dirname, '../package.json'), JSON.stringify(package, null, 2));
};
const getReleasePath = (version, type = 'cjs') => path.join(__dirname, `../release/v${version}_${type}.zip`);
const buildRelease = (version, type = 'cjs') => {
  const zip = new AdmZip();
  const releasePath = getReleasePath(version, type);
  const dir = type === 'cjs' ? '../libDist' : '../esDist';
  zip.addLocalFolder(path.join(__dirname, dir));
  zip.writeZip(releasePath);
};
const buildAllRelease = (newVersion) => {
  buildRelease(newVersion, 'cjs');
  buildRelease(newVersion, 'esm');
}

const uploadFile = (version) => {
  const cjsFile = createReadStream(getReleasePath(version, 'cjs'));
  const esmFile = createReadStream(getReleasePath(version, 'esm'));
  if (!cjsFile || !esmFile) return Promise.reject();
  const cjsDirName = `openApi_v${version}_cjs.zip`;
  const esmDirName = `openApi_v${version}_esm.zip`;
  return Promise.all([uploader.upload({ file: cjsFile, dirName: cjsDirName }), uploader.upload({ file: esmFile, dirName: esmDirName })]);
};


let newVersion = version;
const start = async (newVersion) => {
  log.success('开始打包');
  await buildDist();
  log.success('打包完成');
  buildAllRelease(newVersion);
  log.success(`release包压缩完成: \n ${getReleasePath(newVersion)} \n ${getReleasePath(newVersion, 'esm')}`);
};

createReadLine([
  {
    question: colors.yellow(`请输入版本号(${version}): `),
    callback: async (currentVersion, { done, retry }) => {
      if (!semver.valid(currentVersion)) {
        log.error('版本号不正确');
        return retry();
      }
      if (!semver.lt(version, currentVersion)) {
        log.error(`${currentVersion} <= ${version}`);
        return retry();
      }
      newVersion = currentVersion;
      writeVersion(newVersion);
      log.success(`version: ${newVersion}`);
      await install();
      log.success('依赖安装完成');
      done();
    },
  },
  {
    question: colors.yellow('是否重新创建API declaration? [y]: '),
    callback: (needCreate = 'y', { done, retry, fallback }) => {
      checkReadLine(
        needCreate,
        'y',
        () => {
          generateDeclaration.start().then(() => {
            start(newVersion).then(done).catch(fallback)
          }).catch(() => {
            log.error('declaration生成失败');
            fallback();
          })
        },
        () => {
          log.info('跳过生成declaration');
          start(newVersion).then(done).catch(fallback)
        },
        () => {
          log.warn('输入不正确');
          retry();
        },
      );
    }
  },
  {
    question: colors.yellow('是否上传cdn? [y]: '),
    callback: (needUpload = 'y', { done, retry }) => {
      checkReadLine(
        needUpload,
        'y',
        () => {
          uploadFile(newVersion)
            .then((res) => {
              const [r1, r2] = res || [];
              if (r1.cdnUrl && r2.cdnUrl) {
                log.success(`上传成功: \n cjs: ${r1.cdnUrl} \n esm: ${r2.cdnUrl}`);
              } else {
                log.error(`上传失败: ${JSON.stringify(res)}`);
              }
            })
            .finally(done);
        },
        () => {
          log.info('取消上传');
          done();
        },
        () => {
          log.warn('输入不正确');
          retry();
        },
      );
    },
  },
  {
    question: colors.yellow('是否打包npm? [y]: '),
    callback: (needBuild, { done, retry, close }) => {
      checkReadLine(
        needBuild,
        'y',
        async () => {
          await buildNpm();
          log.success('打包完成');
          done();
        },
        () => {
          log.info('取消打包');
          close();
        },
        () => {
          log.warn('输入不正确');
          retry();
        },
      );
    },
  },
  {
    question: colors.yellow('是否发布npm? [y]: '),
    callback: (needPublish, { done, close, retry }) => {
      checkReadLine(
        needPublish,
        'y',
        async () => {
          await npmPublish();
          log.success('发布完成');
          done();
        },
        () => {
          log.info('取消发布');
          close();
        },
        () => {
          log.warn('输入不正确');
          retry();
        },
      );
    },
  },
], {
  onFallback: () => {
    writeVersion(version);
    log.success(`版本号已回滚至${version}`);
  }
});