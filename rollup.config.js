import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const buildNpm = process.env.BUILD_NPM === 'true';
const BABEL_ENV = process.env.BABEL_ENV || 'esm';

const entry = 'packages/index.ts';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const globals = {};
const externalPkg = buildNpm ? ['axios', 'class-validator', 'crypto-js', 'form-data', 'lodash', 'reflect-metadata', '@babel/runtime'] : [];

const external = id => externalPkg.some(e => id.indexOf(e) === 0);

const commonPlugins = [
  // nodePolyfills(),
  resolve({ extensions }),
  typescript({ useTsconfigDeclarationDir: true }),
  babel({
    exclude: '**/node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    babelHelpers: 'runtime',
    presets: [
      [
        "@babel/preset-env",
      ],
    ],
    plugins: [['@babel/plugin-transform-runtime']]
  }),
  json(),
  commonjs(),
].filter(Boolean);



const umdOutput = {
  format: 'umd',
  name: 'KuaishouMerchantOpenAPI',
  globals,
  assetFileNames: '[name].[ext]',
  exports: 'named',
};

const esOutput = {
  globals,
  preserveModules: true,
  preserveModulesRoot: 'packages',
  exports: 'named',
}

const moduleContext = (id) => {
  const thisAsWindowForModules = [
    'node_modules/class-validator/esm5/validation/Validator.js',
    'node_modules/class-validator/esm5/decorator/common/ValidateNested.js'
  ];

  if (thisAsWindowForModules.some(id_ => id.trimRight().endsWith(id_))) {
    return 'globalThis';
  }
}


export default () => {
  switch (BABEL_ENV) {
    case 'esm':
      return {
        input: [entry],
        preserveModules: true,
        output: { ...esOutput, dir: buildNpm ? 'es/' : 'esDist/', format: 'es' },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      };
    case 'cjs':
      return {
        input: [entry],
        preserveModules: true,
        output: { ...esOutput, dir: buildNpm ? 'lib/' : 'libDist/', format: 'cjs' },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      };
    default:
      return [];
  }
};