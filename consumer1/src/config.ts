export const config = {
  port: 20002,
  kafka: [
    {
      name: 'TEST_KAFKA_1',
      brokers: 'localhost:9092',
      username: '',
      password: '',
      clientId: 'test',
      groupId: 'test-consumer-1',
    },
    {
      name: 'TEST_KAFKA_2',
      brokers: 'localhost:9092',
      username: '',
      password: '',
      clientId: 'test',
      groupId: 'test-consumer-2',
    },
  ],
};
