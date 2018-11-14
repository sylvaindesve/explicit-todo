import { InMemoryEventStore } from "ts-eventsourcing/EventStore/InMemoryEventStore";
import { ConsoleClient } from "./client/console/ConsoleClient";
import { TodoApp } from "./todo/TodoApp";

const app = new TodoApp(new InMemoryEventStore());

const client = new ConsoleClient(app);
client.show();
