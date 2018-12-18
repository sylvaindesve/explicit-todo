import { SimpleCommandBus } from 'ts-eventsourcing/CommandHandling/SimpleCommandBus';
import { FileEventStore } from 'ts-eventsourcing/EventStore/FileEventStore';
import { InMemoryRepository } from 'ts-eventsourcing/ReadModel/InMemoryRepository';
import * as winston from 'winston';
import { ConsoleClient } from './client/console/ConsoleClient';
import { LoggingCommandBusDecorator } from './infrastructure/LoggingCommandBusDecorator';
import { todoAppSerializer } from './infrastructure/todoAppSerializer';
import { TodoListReadModel } from './todo/read/TodoListReadModel';
import { TodoApp } from './todo/TodoApp';

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.File({
    filename: './tmp/app.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
  })],
});

const app = new TodoApp(
  FileEventStore.fromFile('./data/event-store', todoAppSerializer),
  new InMemoryRepository<TodoListReadModel>(),
  { commandBus: new LoggingCommandBusDecorator(new SimpleCommandBus(), logger) },
);

const client = new ConsoleClient(app);
logger.info('Starting...');
client.show();
logger.info('Stopped.');
