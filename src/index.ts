import { FileEventStore } from 'ts-eventsourcing/EventStore/FileEventStore';
import { InMemoryRepository } from 'ts-eventsourcing/ReadModel/InMemoryRepository';
import { ConsoleClient } from './client/console/ConsoleClient';
import { todoAppSerializer } from './infrastructure/todoAppSerializer';
import { TodoListReadModel } from './todo/read/TodoListReadModel';
import { TodoApp } from './todo/TodoApp';

const app = new TodoApp(
  FileEventStore.fromFile('./data/event-store', todoAppSerializer),
  new InMemoryRepository<TodoListReadModel>(),
);

const client = new ConsoleClient(app);
client.show();
