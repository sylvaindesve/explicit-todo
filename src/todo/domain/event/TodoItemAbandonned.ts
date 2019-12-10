import { DomainEvent } from "ts-eventsourcing/Domain/DomainEvent";

export class TodoItemAbandonned implements DomainEvent {
  constructor(public readonly idItem: string) {}
}
