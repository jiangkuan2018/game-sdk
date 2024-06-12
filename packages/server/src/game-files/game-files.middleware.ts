import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { join, dirname, extname } from 'path';
import axios from 'axios';
import { js_beautify } from 'js-beautify';
import * as pfs from 'node:fs/promises';
import { get, has } from 'lodash';
import { fileExists } from '@/utils/tools';

const failFileCount = {};
// 格式化js白名单
const WHITELISTFILE = ['cocos2d-js', 'cocos-js', 'laya'];
@Injectable()
export class GameFilesMiddleware implements NestMiddleware {
  async use(req: Request, expressRes: Response, next: NextFunction) {
    /**
     * req.path = /iam-killer/index.html
     * /游戏名称/资源路径
     */
    const filePath = decodeURIComponent(
      join(__dirname, '../../public/games', req.path),
    );
    const exists = await fileExists(filePath);
    const name = req.path.split('/')[1];
    const path = req.path.replace(`/${name}`, '');
    let url = '';
    const gamemonetizeNamePathMap = await pfs
      .readFile(join(__dirname, '../../public/gamemonetize.json'), {
        encoding: 'utf-8',
      })
      .then(JSON.parse);
    if (has(gamemonetizeNamePathMap, name)) {
      url = `https://html5.gamemonetize.co/${gamemonetizeNamePathMap[name]}${path}`;
    } else {
      url = decodeURIComponent(`https://${name}.apps.minigame.vip${path}`);
    }
    if (failFileCount[url] >= 10 || path == '/undefined') {
      expressRes.writeHead(404, { 'Content-Type': 'text/plain' });
      expressRes.write('404 Not found');
      expressRes.end();
      return;
    }
    console.log(`文件${exists ? '存在' : '不存在'}`, filePath);
    if (exists) {
      next();
    } else {
      if (failFileCount[url]) {
        failFileCount[url] += 1;
      } else {
        failFileCount[url] = 1;
      }
      console.log('请求资源文件', url, failFileCount);
      axios
        .get(url, { responseType: 'arraybuffer' })
        .then(async (res) => {
          expressRes.send(res.data);
          delete failFileCount[url];
          try {
            const directory = dirname(filePath);
            let context = res.data;
            if (
              extname(filePath) === '.js' &&
              WHITELISTFILE.every((w_path) => !filePath.includes(w_path))
            ) {
              context = js_beautify(res.data.toString('utf-8'));
            }
            await pfs.mkdir(directory, { recursive: true });
            await pfs.writeFile(filePath, context);
            console.log('文件写入成功', filePath);
          } catch (error) {
            console.error('文件写入错误', error);
          }
        })
        .catch((error) => {
          const status = get(error, 'response.status', 500);
          const headers = get(error, 'response.headers', '');
          console.error('文件请求失败', {
            status,
            headers,
            url,
          });
          expressRes.status(status).send(error);
        });
    }
  }
}
