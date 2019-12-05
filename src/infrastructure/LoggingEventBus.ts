import { ClassUtil } from "ts-eventsourcing/ClassUtil";
import { DomainEventStream } from "ts-eventsourcing/Domain/DomainEventStream";
import { DomainEventBus } from "ts-eventsourcing/EventHandling/DomainEventBus";
import { EventListener } from "ts-eventsourcing/EventHandling/EventListener";
import winston = require("winston");

export class LoggingEventBus implements DomainEventBus {
  constructor(private bus: DomainEventBus, private logger: winston.Logger) {}

  public publish(domainMessages: DomainEventStream): void {
    this.bus.publish(domainMessages);
    domainMessages.subscribe(message => {
      this.logger.info(`Published event ${ClassUtil.nameOff(message.payload)}`);
    });
  }

  public subscribe(eventListener: EventListener): void {
    this.bus.subscribe(eventListener);
  }
}
