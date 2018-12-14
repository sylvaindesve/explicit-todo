import { Command } from 'ts-eventsourcing/CommandHandling/Command';

export class AddItemToTodoList implements Command {

  constructor(
    public readonly id: string,
    public readonly itemId: string,
    public readonly description: string,
  ) {}

}
