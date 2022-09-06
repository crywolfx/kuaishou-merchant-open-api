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

const version = package.version;

const uploader = new Uploader({ dirName: '/open-api' });

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

const createReadLine = (questionList = []) => {
  const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readLineInterface.on('close', () => {
    process.exit(0);
  });
  const setQuestion = (i = 0) => {
    const item = questionList[i];
    if (item.question && item.callback) {
      readLineInterface.question(item.question, (answer) => {
        item.callback(answer, {
          done: () => {
            if (i === questionList.length - 1) {
              return readLineInterface.close();
            }
            if (i < questionList.length) return setQuestion(++i);
          },
          close: () => {
            return readLineInterface.close();
          },
          retry: () => {
            return setQuestion(i);
          },
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

const install = () => runSpawn('yarn install');
const buildNpm = () => runSpawn('yarn', ['build:npm']);
const npmPublish = () => runSpawn('npm', ['publish']);
const buildDist = () => runSpawn('yarn', ['build:dist']);
const writeVersion = (version) => {
  package.version = version;
  writeFileSync(path.join(__dirname, '../package.json'), JSON.stringify(package, null, 2));
};
const getReleasePath = (version) => path.join(__dirname, `../release/v${version}.zip`);
const buildRelease = (releasePath) => {
  const zip = new AdmZip();
  zip.addLocalFolder(path.join(__dirname, '../esDist'));
  zip.addLocalFolder(path.join(__dirname, '../libDist'));
  zip.writeZip(releasePath);
};

const uploadFile = (version) => {
  const file = createReadStream(getReleasePath(version));
  if (!file) return Promise.reject();
  const dirName = `openApi_v${version}.zip`;
  return uploader.upload({ file, dirName });
};


let newVersion = version;
const start = async (newVersion) => {
  writeVersion(newVersion);
  log.success(`version: ${newVersion}`);
  await install();
  log.success('依赖安装完成');
  await buildDist();
  log.success('打包完成');
  buildRelease(getReleasePath(newVersion));
  log.success(`release包压缩完成: ${getReleasePath(newVersion)}`);
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
      await Promise.resolve(start(currentVersion));
      done();
    },
  },
  {
    question: colors.yellow('是否上传cdn? [y]: '),
    callback: (needUpload = 'y', { done, retry }) => {
      checkReadLine(
        needUpload,
        'y',
        () => {
          uploadFile(newVersion)
            .then((r) => {
              if (r.cdnUrl) {
                log.success(`上传成功: ${r.cdnUrl}`);
              } else {
                log.error(`上传失败: ${JSON.stringify(r)}`);
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
    question: colors.yellow('是否发布npm? [y]'),
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
]);