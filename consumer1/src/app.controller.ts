import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { config } from '@src/config';

@Controller()
export class AppController {
  private callbackMap = new Map<string, Function>();

  constructor() {
    const topic: string = 'test';
    const groupIds = config.kafka.map(({ groupId }) => `${groupId}-server`);

    this.callbackMap.set(`${topic}:${groupIds[0]}`, this.callback1);
    this.callbackMap.set(`${topic}:${groupIds[1]}`, this.callback2);
  }

  @Get('/hc')
  healthCheck(): string {
    return 'OK';
  }

  // @MessagePattern('test')
  @EventPattern('test')
  async handleTest(@Payload() message: any, @Ctx() context: KafkaContext) {
    const group = await context.getConsumer().describeGroup();
    const topic = context.getTopic();
    const callbackName = `${topic}:${group.groupId}`;
    console.log(callbackName, 'duarbdhks 0000000000');
    // console.log(context.getMessage().offset, 'duarbdhks 9999999999');
    const func = this.callbackMap.get(callbackName);
    if (func) {
      await func(message, context);
    } else {
      console.log('no callback function');
    }

    return 'handleVideoWatch 응답 잘 받았어';
  }

  // groupId: test-consumer-1-server
  async callback1(@Payload() message: any, @Ctx() context: KafkaContext) {
    console.log(message, context.getMessage().offset, 'duarbdhks callback1 payload 1111111111\n');
    throw new Error('callback1 is die');
  }

  // groupId: test-consumer-2-server
  async callback2(@Payload() message: any, @Ctx() context: KafkaContext) {
    console.log(message, context.getMessage().offset, 'duarbdhks callback2 payload 2222222222\n');
  }
}
