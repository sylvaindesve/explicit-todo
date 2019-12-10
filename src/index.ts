import { SimpleCommandBus } from "ts-eventsourcing/CommandHandling/SimpleCommandBus";
import { AsynchronousDomainEventBus } from "ts-eventsourcing/EventHandling/DomainEventBus/AsynchronousDomainEventBus";
import { FileEventStore } from "ts-eventsourcing/EventStore/FileEventStore";
import { SimpleQueryBus } from "ts-eventsourcing/QueryHandling/SimpleQueryBus";
import * as winston from "winston";
import { ConsoleClient } from "./client/console/ConsoleClient";
import { FileRepository } from "./infrastructure/FileRepository";
import { LoggingCommandBusDecorator } from "./infrastructure/LoggingCommandBusDecorator";
import { LoggingEventBus } from "./infrastructure/LoggingEventBus";
import { LoggingQueryBusDecorator } from "./infrastructure/LoggingQueryBusDecorator";
import { todoAppSerializer } from "./infrastructure/todoAppSerializer";
import { TodoApp } from "./todo";

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.File({
      filename: "./tmp/app.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    })
  ]
});

const app = new TodoApp(
  FileEventStore.fromFile("./data/event-store", todoAppSerializer),
  new FileRepository("./data/todolist-store", todoAppSerializer),
  new FileRepository("./data/stats-store", todoAppSerializer),
  {
    commandBus: new LoggingCommandBusDecorator(new SimpleCommandBus(), logger),
    eventBus: new LoggingEventBus(new AsynchronousDomainEventBus(), logger),
    queryBus: new LoggingQueryBusDecorator(new SimpleQueryBus(), logger)
  }
);

process.on("exit", _code => {
  logger.info("Stopped.");
});

const client = new ConsoleClient(app);
logger.info("Starting...");
client.show();
