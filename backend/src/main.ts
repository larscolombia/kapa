import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware de logging extremo para TODAS las requests
  app.use((req, res, next) => {
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req['requestId'] = requestId;

    console.log(`\n[${requestId}] ========================================`);
    console.log(`[${requestId}] INCOMING REQUEST`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Method: ${req.method}`);
    console.log(`[${requestId}] URL: ${req.url}`);
    console.log(`[${requestId}] Path: ${req.path}`);
    console.log(`[${requestId}] Original URL: ${req.originalUrl}`);
    console.log(`[${requestId}] Base URL: ${req.baseUrl}`);
    console.log(`[${requestId}] Headers:`, JSON.stringify({
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'user-agent': req.headers['user-agent'],
      'host': req.headers['host'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
    }, null, 2));
    console.log(`[${requestId}] Query params:`, JSON.stringify(req.query, null, 2));

    if (req.method !== 'GET' && req.body) {
      const bodyStr = typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : String(req.body);
      console.log(`[${requestId}] Body preview (primeros 500 chars):`,
        bodyStr.substring(0, 500));
    }

    // Interceptar respuesta
    const originalSend = res.send;
    res.send = function (data) {
      console.log(`[${requestId}] RESPONSE STATUS: ${res.statusCode}`);
      if (res.statusCode >= 400) {
        const dataStr = typeof data === 'string' ? data : (data ? JSON.stringify(data) : 'No data');
        console.error(`[${requestId}] ERROR RESPONSE BODY:`,
          dataStr.substring(0, 1000));
      }
      console.log(`[${requestId}] ======================================== END\n`);
      return originalSend.call(this, data);
    };

    next();
  });

  app.enableCors();

  // Prefijo global para todas las rutas API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  // Configurar para escuchar en todas las interfaces
  await app.listen(port, '0.0.0.0');
  console.log(`\n========================================`);
  console.log(`🚀 KAPA Backend Server Started`);
  console.log(`📍 Port: ${port}`);
  console.log(`🌐 Listening on: 0.0.0.0:${port}`);
  console.log(`⏰ Start time: ${new Date().toISOString()}`);
  console.log(`🔍 Extreme Debugging: ENABLED`);
  console.log(`========================================\n`);
}
bootstrap();
