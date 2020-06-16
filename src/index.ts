import * as fs from "fs";
import "reflect-metadata";
import { SimpleCommandBus } from "ts-eventsourcing/CommandHandling/SimpleCommandBus";
import { AsynchronousDomainEventBus } from "ts-eventsourcing/EventHandling/DomainEventBus/AsynchronousDomainEventBus";
import { EventStore } from "ts-eventsourcing/EventStore/EventStore";
import { FileEventStore } from "ts-eventsourcing/EventStore/FileEventStore";
import { SimpleQueryBus } from "ts-eventsourcing/QueryHandling/SimpleQueryBus";
import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import { Identity } from "ts-eventsourcing/ValueObject/Identity";
import { createConnection } from "typeorm";
import { promisify } from "util";
import * as winston from "winston";
import { ConsoleClient } from "./client/console/ConsoleClient";
import { FileRepository } from "./infrastructure/FileRepository";
import { LoggingCommandBusDecorator } from "./infrastructure/LoggingCommandBusDecorator";
import { LoggingEventBus } from "./infrastructure/LoggingEventBus";
import { LoggingQueryBusDecorator } from "./infrastructure/LoggingQueryBusDecorator";
import { todoAppSerializer } from "./infrastructure/todoAppSerializer";
import { DomainMessageEntity } from "./infrastructure/typeorm/DomainMessageEntity";
import { PersistenceEventStore } from "./infrastructure/typeorm/PersistenceEventStore";
import { TodoListEntity } from "./infrastructure/typeorm/TodoListEntity";
import { TodoListRepository } from "./infrastructure/typeorm/TodoListRepository";
import { StatsReadModel, TodoApp, TodoListReadModel } from "./todo";

const readFile = promisify(fs.readFile);

(async () => {
  // Instanciate logger
  const logger = winston.createLogger({
    level: "debug",
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

  // Load configuration
  logger.info("Loading configuration");
  const rawConfig = await readFile("todoconfig.json");
  const config = JSON.parse(rawConfig.toString());

  const dbCnx = await createConnection();

  // Event Store
  let eventStore: EventStore<Identity>;
  if (config.eventStore === "db") {
    logger.info("Using Database Event Store");
    eventStore = new PersistenceEventStore(
      dbCnx.getRepository(DomainMessageEntity),
      todoAppSerializer
    );
  } else {
    logger.info("Using File Event Store");
    eventStore = FileEventStore.fromFile(
      "./data/event-store",
      todoAppSerializer
    );
  }

  // Todo Store
  let todoStore: Repository<TodoListReadModel, Identity>;
  if (config.todoStore === "db") {
    logger.info("Using Database Todo Store");
    todoStore = new TodoListRepository(
      dbCnx.getRepository(TodoListEntity),
      logger
    );
  } else {
    logger.info("Using File Todo Store");
    todoStore = new FileRepository("./data/todolist-store", todoAppSerializer);
  }

  // Stats Store
  let statsStore: Repository<StatsReadModel, Identity>;
  if (config.statsStore === "db") {
    throw new Error("DB store not implemented for stats");
  } else {
    logger.info("Using File Stats Store");
    statsStore = new FileRepository("./data/stats-store", todoAppSerializer);
  }

  // Todo Application
  const app = new TodoApp(eventStore, todoStore, statsStore, {
    commandBus: new LoggingCommandBusDecorator(new SimpleCommandBus(), logger),
    eventBus: new LoggingEventBus(new AsynchronousDomainEventBus(), logger),
    queryBus: new LoggingQueryBusDecorator(new SimpleQueryBus(), logger)
  });

  process.on("exit", _code => {
    logger.info("Stopped.");
  });

  const client = new ConsoleClient(app);
  logger.info("Starting...");
  client.show();
})();
