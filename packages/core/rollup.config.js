import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'rollup'
import { babel } from '@rollup/plugin-babel';
import JavaScriptObfuscator from 'javascript-obfuscator'
import terser from '@rollup/plugin-terser'
import * as rimraf from 'rimraf'

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
        compact: true,
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

const dev = [
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**'
  })
]

const prod = [
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**'
  }),
  codeObfuscator(),
  terser(),
  removeDist()
]

export default defineConfig({
  input: './src/index.js',
  output: [
    {
      format: 'cjs',
      file: './dist/index.cjs.min.js',
      sourcemap: development,
      name: pkg.name
    },
    {
      format: 'es',
      file: './dist/index.es.min.js',
      sourcemap: development
    }
  ],
  plugins: development ? dev : prod
})
