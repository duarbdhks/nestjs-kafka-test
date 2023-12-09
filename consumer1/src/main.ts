import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from '@src/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  for (const kafkaConfig of config.kafka) {
    const { clientId, brokers, groupId } = kafkaConfig;
    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.KAFKA,
        options: {
          client: { clientId, brokers: brokers.split(','), retry: { retries: 3 } },
          consumer: { groupId },
          postfixId: '-server',
        },
      },
      { inheritAppConfig: true },
    );
  }

  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();
  await app.listen(config.port);
}

bootstrap().catch(console.error);
