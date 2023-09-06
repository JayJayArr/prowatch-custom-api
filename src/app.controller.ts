import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @UseGuards(AuthGuard('basic'))
  getTnaPW(@Body() body):
    | Promise<{
        recordset: { REC_DAT: string; OsCislo: string; DatumACas: string }[];
        rowsAffected: number;
      }>
    | Promise<string> {
    if (body.starttime == '' || body.starttime == undefined) {
      throw new HttpException('Starttime is missing', HttpStatus.BAD_REQUEST);
    } else if (body.endtime == '' || body.endtime == undefined) {
      throw new HttpException('Endtime is missing', HttpStatus.BAD_REQUEST);
    } else {
      return this.appService.getTnaPW(body.starttime, body.endtime);
    }
  }
}
