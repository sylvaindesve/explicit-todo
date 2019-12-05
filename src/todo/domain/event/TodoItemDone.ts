import { DomainEvent } from "ts-eventsourcing/Domain/DomainEvent";

export class TodoItemDone implements DomainEvent {
  constructor(public readonly idItem: string) {}
}
