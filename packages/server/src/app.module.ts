import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameFilesModule } from './game-files/game-files.module';

@Module({
  imports: [GameFilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
