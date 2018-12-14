import { DomainEvent } from 'ts-eventsourcing/Domain/DomainEvent';

export class TodoItemAdded implements DomainEvent {

  constructor(
    public readonly idItem: string,
    public readonly description: string,
  ) {}

}
