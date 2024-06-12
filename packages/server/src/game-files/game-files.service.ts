import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import * as pfs from 'fs/promises';
import * as cheerio from 'cheerio';
import { split, kebabCase, set } from 'lodash';
import { fileExists } from '@/utils/tools';

const SDK_SCRIPT = `<script type="text/javascript" src="https://sdk.footbzgame.com/js/1.1/footbzgame_adv_sdk.js"></script></head>`;

@Injectable()
export class GameFilesService {
  createLocalMiniGameDir(url: string) {
    const parseUrl = new URL(url);
    const gameName = split(parseUrl.pathname, '/')[2];
    const minigame = '.apps.minigame.vip';
    return new Promise((resolve, reject) => {
      const host = `${gameName}${minigame}`;
      const filePath = path.join(
        __dirname,
        `../../public/games/${gameName}/index.html`,
      );
      if (fs.existsSync(filePath)) {
        resolve({
          status: 201,
          message: '游戏文件已存在',
        });
        return;
      }
      axios
        .get(`https://${host}/minigame-index.html`)
        .then(async (res) => {
          console.log('初始化minigame文件夹');
          fs.mkdirSync(path.dirname(filePath.replace(minigame, '')), {
            recursive: true,
          });
          const $ = cheerio.load(res.data);
          $('head').append(SDK_SCRIPT);
          fs.writeFileSync(filePath, $.html());
          const publicPath = path.join(__dirname, `../../public/`);
          await pfs.copyFile(
            `${publicPath}footbzgame-config.json`,
            `${publicPath}games/${gameName}/footbzgame-config.json`,
          );
          resolve({
            status: 200,
            message: `${gameName}添加成功！`,
          });

          const img_path = path.join(
            __dirname,
            `../../public/s-assets/H5-1/${gameName}.png`,
          );
          const { data } = await axios.get(
            `https://res.minigame.vip/gc-assets/${gameName}/${gameName}_icon.png`,
            { responseType: 'arraybuffer' },
          );
          fs.writeFileSync(img_path, data);
        })
        .catch((error) => {
          console.log(error);
          reject({
            status: 10001,
            message: `${gameName}添加失败`,
            error,
          });
        });
    });
  }
  async createLocalGamemonetizeGameDir(url: string) {
    const parseUrl = new URL(url);
    const gameKey = parseUrl.pathname.split('/')[1];
    const [gamePageIndexData, thumb] = await Promise.all([
      axios.get(url),
      axios.get(`https://img.gamemonetize.com/${gameKey}/512x384.jpg`, {
        responseType: 'arraybuffer',
      }),
    ]);
    const $ = cheerio.load(gamePageIndexData.data);
    $('head').append(SDK_SCRIPT);
    const gameName = kebabCase($('head title').text());
    const filePath = path.join(
      __dirname,
      `../../public/games/${gameName}/index.html`,
    );
    const dir = path.dirname(filePath);
    if (await fileExists(filePath)) {
      return {
        status: 201,
        message: '添加失败，文件已存在',
        data: null,
      };
    }
    await pfs.mkdir(dir);
    await pfs.writeFile(filePath, $.html());
    await pfs.writeFile(
      path.join(__dirname, `../../public/s-assets/H5-1/${gameName}.jpg`),
      thumb.data,
    );
    const gamemonetizeDataFilePath = path.join(
      __dirname,
      '../../public/gamemonetize.json',
    );
    const gamemonetizeData = await pfs
      .readFile(gamemonetizeDataFilePath, {
        encoding: 'utf-8',
      })
      .then(JSON.parse);

    await pfs.writeFile(
      gamemonetizeDataFilePath,
      JSON.stringify(set(gamemonetizeData, gameName, gameKey), null, 2),
      { encoding: 'utf-8' },
    );
    return {
      status: 200,
      message: '添加成功',
      data: null,
    };
  }
}
