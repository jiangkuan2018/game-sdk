import { PartialType } from '@nestjs/mapped-types';
import { CreateGameFileDto } from './create-game-file.dto';

export class UpdateGameFileDto extends PartialType(CreateGameFileDto) {}
