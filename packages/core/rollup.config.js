import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'rollup'
import { babel } from '@rollup/plugin-babel';
import JavaScriptObfuscator from 'javascript-obfuscator'
import terser from '@rollup/plugin-terser'
import * as rimraf from 'rimraf'
import serve from 'rollup-plugin-serve'

const development = process.env.ROLLUP_WATCH === 'true'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), { encoding: 'utf-8' }))

function removeDist() {
  return {
    name: 'rollup-plugin-remove-dist',
    buildStart(inputOptions) {
      if (!development) {
        rimraf.sync(path.resolve(__dirname, './dist'))
      }
    }
  }
}

function codeObfuscator() {
  return {
    name: 'rollup-plugin-javascript-obfuscator',
    transform(code, fileName) {
      const result = JavaScriptObfuscator.obfuscate(code, {
        compact: false,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        debugProtectionInterval: 0,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: false,
        stringArray: true,
        stringArrayCallsTransform: false,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: [],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false,
        inputFileName: fileName,
        sourceMap: development
      })
      return {
        code: result.getObfuscatedCode(),
        map: development ? result.getSourceMap() : undefined
      }
    }
  }
}


const plugins = [
  removeDist(),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**'
  }),
  terser(),
  serve({
    contentBase: './dist',
    port: 3001
  })
]

export default defineConfig([
  {
    input: './src/ads/game.js',
    output: [
      {
        format: 'umd',
        file: './dist/ads-game.min.js',
        sourcemap: development
      }
    ],
    plugins,
  },
  {
    input: './src/ads/site.js',
    output: [
      {
        format: 'umd',
        file: './dist/ads-site.min.js',
        sourcemap: development
      }
    ],
    plugins,
  }
  ,
  {
    input: './src/adx/site.js',
    output: [
      {
        format: 'umd',
        file: './dist/adx-site.min.js',
        sourcemap: development
      }
    ],
    plugins,
  }
  ,
  {
    input: './src/adx/game.js',
    output: [
      {
        format: 'umd',
        file: './dist/adx-game.min.js',
        sourcemap: development
      }
    ],
    plugins,
  }
])
