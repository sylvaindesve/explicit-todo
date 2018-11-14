import { Command } from "ts-eventsourcing/CommandHandling/Command";

export class MarkItemDone implements Command {

  constructor(
    public readonly id: string,
    public readonly itemId: string,
  ) {}

}
