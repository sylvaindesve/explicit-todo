import { ClassUtil } from "ts-eventsourcing/ClassUtil";
import { CommandBus } from "ts-eventsourcing/CommandHandling/CommandBus";
import { CommandHandler } from "ts-eventsourcing/CommandHandling/CommandHandler";
import * as winston from "winston";

export class LoggingCommandBusDecorator implements CommandBus {
  constructor(private bus: CommandBus, private logger: winston.Logger) {}

  public subscribe(handler: CommandHandler): void {
    this.bus.subscribe(handler);
  }

  public dispatch(command: object): Promise<any> {
    const start = Date.now();
    const result = this.bus.dispatch(command);
    result.then(() => {
      this.logger.info(
        `Command ${ClassUtil.nameOff(command)} handled in ${Date.now() -
          start}ms`
      );
    });
    return result;
  }
}
