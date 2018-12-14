import { DomainEvent } from 'ts-eventsourcing/Domain/DomainEvent';

export class TodoListNameChanged implements DomainEvent {

  constructor(
    public readonly name: string,
  ) {}

}
