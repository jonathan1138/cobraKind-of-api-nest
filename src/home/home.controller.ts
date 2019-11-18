import { Controller, Get } from '@nestjs/common';

@Controller('')
export class HomeController {
    @Get()
    getHome() {
        return 'Welcome to the CobraKind API';
    }
}
