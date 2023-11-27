import { MulterModule } from '@nestjs/platform-express';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Destination folder for uploaded files
    }),
  ],
})
export class FileUploadModule {}
