import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get('/')
  task(@Body() body: Body) {
    console.log(body);
    return 'test';
  }
}
