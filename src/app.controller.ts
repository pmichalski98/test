import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

interface TaskI {
  question: string;
}
@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Post('/')
  async task(@Body() body: TaskI) {
    const res = await this._appService.handleRequest(body.question);
    return res;
  }
}
