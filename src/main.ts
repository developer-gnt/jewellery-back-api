import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('app.prefix', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Zewar Mahal API')
    .setDescription(
      'REST API for Zewar Mahal Jewellery — Mobile App & CMS Backend',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Authentication & OTP')
    .addTag('users', 'User & Profile')
    .addTag('home', 'Home Dashboard')
    .addTag('categories', 'Jewellery Categories')
    .addTag('products', 'Jewellery Catalogue & Products')
    .addTag('rates', 'Gold & Silver Rates')
    .addTag('shop-rates', 'My / Shop Rates')
    .addTag('offers', 'Offers & Promotions')
    .addTag('banners', 'Banner Management')
    .addTag('enquiries', 'Customer Enquiries')
    .addTag('notifications', 'Notifications & FCM')
    .addTag('admin', 'Admin Auth & Management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  console.log(`🚀 Zewar Mahal API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api`);
}

await bootstrap();
