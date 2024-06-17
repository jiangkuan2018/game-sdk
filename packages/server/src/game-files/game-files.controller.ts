import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GameFilesService } from './game-files.service';
import { join, resolve } from 'path';
import * as fs from 'fs';
import { endsWith, filter, includes, map } from 'lodash';

@Controller('game-files')
export class GameFilesController {
  constructor(private readonly gameFilesService: GameFilesService) {}

  @Post('/create-local-game-dir')
  createLocalGame(@Body('url') url: string) {
    try {
      const parseUrl = new URL(url);

      if (endsWith(parseUrl.host, 'minigame.vip')) {
        return this.gameFilesService.createLocalMiniGameDir(url);
      } else if (endsWith(parseUrl.host, 'gamemonetize.co')) {
        return this.gameFilesService.createLocalGamemonetizeGameDir(url);
      } else {
        return new HttpException(
          '当前游戏站点链接暂未支持',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return new HttpException(
        'url解析失败，请检查url格式',
        HttpStatus.BAD_REQUEST,
        error,
      );
    }
  }
  @Get('/list')
  listGame() {
    const gamesFolderPath = '../../public/games';
    const filteredFolders = filter(
      fs.readdirSync(join(__dirname, gamesFolderPath)),
      (name) => !includes(['.DS_Store'], name),
    );
    const data = map(filteredFolders, (name) => {
      const stat = fs.statSync(
        resolve(__dirname, `${gamesFolderPath}/${name}`),
      );
      return {
        folderName: name,
        folderDate: stat.birthtime,
        ms: stat.birthtimeMs,
      };
    }).sort((a, b) => b.ms - a.ms);

    return { data };
  }
}
