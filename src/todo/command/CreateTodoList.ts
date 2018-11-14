import { Command } from "ts-eventsourcing/CommandHandling/Command";

export class CreateTodoList implements Command {

  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}

}
