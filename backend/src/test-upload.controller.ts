import { Controller, Post, Get } from '@nestjs/common';

@Controller('test-upload')
export class TestUploadController {
  @Get()
  test() {
    return { message: 'Test upload working' };
  }
  
  @Post()
  upload() {
    return { message: 'Upload test working' };
  }
}
