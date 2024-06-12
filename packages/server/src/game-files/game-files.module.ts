import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameFilesService } from './game-files.service';
import { GameFilesController } from './game-files.controller';
import { GameFilesMiddleware } from './game-files.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../public/games'),
      serveRoot: '/games/',
    }),
  ],
  controllers: [GameFilesController],
  providers: [GameFilesService],
})
export class GameFilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GameFilesMiddleware).forRoutes('/games/');
  }
}
