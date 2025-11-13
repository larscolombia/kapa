import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const requestId = req['requestId'] || `INT-${Date.now()}`;
    const now = Date.now();
    
    console.log(`[${requestId}] 🎯 INTERCEPTOR: Entrando al handler ${context.getClass().name}.${context.getHandler().name}`);

    return next.handle().pipe(
      tap((data) => {
        const elapsed = Date.now() - now;
        console.log(`[${requestId}] ✅ INTERCEPTOR: Handler completado exitosamente en ${elapsed}ms`);
        if (data) {
          console.log(`[${requestId}] 📦 Response data type: ${typeof data}`);
          if (typeof data === 'object') {
            console.log(`[${requestId}] 📦 Response keys:`, Object.keys(data));
          }
        }
      }),
      catchError((error) => {
        const elapsed = Date.now() - now;
        console.error(`[${requestId}] ❌ INTERCEPTOR: Error capturado después de ${elapsed}ms`);
        console.error(`[${requestId}] ❌ Error name: ${error?.name}`);
        console.error(`[${requestId}] ❌ Error message: ${error?.message}`);
        console.error(`[${requestId}] ❌ Error status: ${error?.status || 'No status'}`);
        console.error(`[${requestId}] ❌ Error response:`, JSON.stringify(error?.response, null, 2));
        console.error(`[${requestId}] ❌ Error stack:`, error?.stack);
        
        // Re-lanzar el error
        return throwError(() => error);
      }),
    );
  }
}
