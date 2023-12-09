import { Controller, Get, Inject, OnModuleDestroy, OnModuleInit, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { config } from '@src/config';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AppController implements OnModuleInit, OnModuleDestroy {
  private MODULAR: number;
  readonly TOPIC: string = 'test';

  constructor(@Inject(config.kafka[0].name) private readonly client: ClientKafka) {
    this.MODULAR = 3;
  }

  async onModuleInit(): Promise<void> {
    this.client.subscribeToResponseOf(this.TOPIC);
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  @Get('/hc')
  healthCheck(): string {
    return 'OK';
  }

  @Get('/video/watch')
  videoWatch(@Query('user_id') userId = 2): Observable<string> {
    const partition = userId % this.MODULAR;
    const id = 1234;
    const value = JSON.stringify({
      type: 'video.watch',
      data: { id, date: new Date() },
    });
    const headers = { uuid: uuidv4() };
    const message = { partition, key: id, value, headers };
    return this.client.emit('test', message);
  }

  @Get('/words/memorize')
  wordsMemorize(@Query('user_id') userId = 2): Observable<string> {
    const partition = userId % this.MODULAR;
    const id = 5555555;
    const value = JSON.stringify({
      type: 'words.memorize',
      data: { id, date: new Date() },
    });
    const headers = { uuid: uuidv4() };
    const message = { partition, key: id, value, headers };
    return this.client.emit('test', message);
  }
}
