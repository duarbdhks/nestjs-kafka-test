import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { AppController } from '@src/app.controller';
import { config } from '@src/config';
import { createHash } from 'crypto';
import { Message, PartitionerArgs } from 'kafkajs';

const hashPartitioner = () => {
  return (args: PartitionerArgs) => {
    const { topic, partitionMetadata, message } = args;
    if (message?.partition !== undefined) return message.partition;

    const calculatePartitionBasedOnKey = (message: Message, numberOfPartitions: number) => {
      const hashedKey = createHash('sha256').update(message.key).digest('hex');
      return parseInt(hashedKey, 16) % numberOfPartitions;
    };

    const numberOfPartitions = partitionMetadata.length;
    return calculatePartitionBasedOnKey(message, numberOfPartitions);
  };
};

const KafkaProviders: ClientsModuleOptions = config.kafka.map(kafkaConfig => {
  const { name, clientId, brokers } = kafkaConfig;
  return {
    name,
    transport: Transport.KAFKA,
    options: {
      client: { clientId, brokers: brokers.split(','), retry: { retries: 3 } },
      producer: { createPartitioner: hashPartitioner },
      postfixId: '-client',
    },
  };
});

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ClientsModule.register([...KafkaProviders])],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
