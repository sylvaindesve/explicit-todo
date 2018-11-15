import { InMemoryEventStore } from "ts-eventsourcing/EventStore/InMemoryEventStore";
import { InMemoryRepository } from "ts-eventsourcing/ReadModel/InMemoryRepository";
import { ConsoleClient } from "./client/console/ConsoleClient";
import { SqliteEventStore } from "./infrastructure/SqliteEventStore";
import { TodoListReadModel } from "./todo/read/TodoListReadModel";
import { TodoApp } from "./todo/TodoApp";

const app = new TodoApp(
  new SqliteEventStore("./database.sqlite"),
  new InMemoryRepository<TodoListReadModel>(),
);

const client = new ConsoleClient(app);
client.show();
