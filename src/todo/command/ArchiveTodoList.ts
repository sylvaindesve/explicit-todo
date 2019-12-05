import { Command } from "ts-eventsourcing/CommandHandling/Command";

export class ArchiveTodoList implements Command {
  constructor(public readonly id: string) {}
}
