import { InMemoryEventStore } from "ts-eventsourcing/EventStore/InMemoryEventStore";
import { InMemoryRepository } from "ts-eventsourcing/ReadModel/InMemoryRepository";
import { ConsoleClient } from "./client/console/ConsoleClient";
import { TodoListReadModel } from "./todo/query/TodoListReadModel";
import { TodoApp } from "./todo/TodoApp";

const app = new TodoApp(
  new InMemoryEventStore(),
  new InMemoryRepository<TodoListReadModel>(),
);

const client = new ConsoleClient(app);
client.show();
