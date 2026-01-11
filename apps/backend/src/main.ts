import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log('=== Validation Errors ===');
        errors.forEach(err => {
          console.log(`Field: ${err.property}`);
          console.log(`Value: ${JSON.stringify(err.value)}`);
          console.log(`Constraints:`, err.constraints);
        });
        console.log('========================');
        return new ValidationPipe().createExceptionFactory()(errors);
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('주간보고 시스템 API')
    .setDescription('SM 프로젝트 주간보고서 시스템 REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
