import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RoundTripInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    Logger.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => Logger.log(`After... ${Date.now() - now}ms`)));
  }
}
