import { Command } from 'ts-eventsourcing/CommandHandling/Command';

export class RenameTodoList implements Command {

  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}

}
