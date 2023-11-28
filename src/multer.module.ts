import { MulterModule } from '@nestjs/platform-express';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Destination folder for uploaded files
    }),
  ],
  controllers: [AppController],
})
export class FileUploadModule {}
