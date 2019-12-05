import { ClassUtil } from "ts-eventsourcing/ClassUtil";
import { Query } from "ts-eventsourcing/QueryHandling/Query";
import { QueryBus } from "ts-eventsourcing/QueryHandling/QueryBus";
import { QueryHandler } from "ts-eventsourcing/QueryHandling/QueryHandler";
import winston = require("winston");

export class LoggingQueryBusDecorator implements QueryBus {
  constructor(private bus: QueryBus, private logger: winston.Logger) {}

  public subscribe(handler: QueryHandler): void {
    this.bus.subscribe(handler);
  }

  public dispatch(query: Query): Promise<any> {
    const start = Date.now();
    const result = this.bus.dispatch(query);
    result.then(() => {
      this.logger.info(
        `Query ${ClassUtil.nameOff(query)} handled in ${Date.now() - start}ms`
      );
    });
    return result;
  }
}
