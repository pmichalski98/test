import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface TaskI {
  question: string;
}
@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Post('test')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, callback) => {
          callback(null, `audio.wav`);
        },
      }),
    }),
  )
  async test(@UploadedFile() file) {
    console.log(file, 'here');
    const res = await this._appService.handleAudio(file.buffer);
    return 'jazda essa';
  }
  @Post('markdown')
  async handleMarkdown(@Body() body: TaskI) {
    console.log(body);
    const answer = await this._appService.handleMarkdown(body.question);
    console.log(answer);
    return { reply: answer };
  }
  @Post('/google')
  async handleGoogle(@Body() body: TaskI) {
    console.log(body);
    const answer = await this._appService.handleGoogle(body.question);
    return {
      reply: answer,
    };
  }
  @Get('/')
  getTest() {
    return 'test';
  }
  @Post('/')
  async task(@Body() body: TaskI) {
    const res = await this._appService.handleRequest(body.question);
    return { reply: res };
  }
  @Post('/pro')
  async taskPro(@Body() body: TaskI) {
    console.log(body);
    const res = await this._appService.handleRequestPro(body.question);
    return { reply: res };
  }
}
