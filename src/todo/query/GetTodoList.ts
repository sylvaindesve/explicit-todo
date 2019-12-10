import { Query } from "ts-eventsourcing/QueryHandling/Query";

export class GetTodoList implements Query {
  constructor(public readonly id: string) {}
}
