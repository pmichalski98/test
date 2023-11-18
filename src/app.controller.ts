import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Post('/')
  task(@Body() body: Body) {
    console.log(body);
    console.log('here');
    return 'test';
  }
}
