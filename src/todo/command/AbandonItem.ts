import { Command } from "ts-eventsourcing/CommandHandling/Command";

export class AbandonItem implements Command {
  constructor(public readonly id: string, public readonly itemId: string) {}
}
