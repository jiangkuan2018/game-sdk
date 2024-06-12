import * as pfs from 'node:fs/promises'
import * as fs from 'fs'

export class HttpResult {
  data = null
  success: boolean
  msg: string
  constructor(data: any, success: boolean, msg: string = '') {
    this.data = data
    this.success = success
    this.msg = msg
  }
}

/**
 * @description 检查文件是否存在
 * @param path
 * @returns
 */
export async function fileExists(path: string) {
  try {
    await pfs.access(path, fs.constants.R_OK)
    return true
  } catch (error) {
    return false
  }
}
