import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Task } from 'langchain/dist/experimental/babyagi';

interface TaskI {
  question: string;
}
@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

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
