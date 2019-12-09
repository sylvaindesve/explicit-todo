import { ReadModel } from "ts-eventsourcing/ReadModel/ReadModel";
import { TodoListId } from "..";

export class TodoListReadModel implements ReadModel<TodoListId> {
  public name: string = "";
  public items: Array<{ id: string; description: string; done: boolean }> = [];

  constructor(public readonly id: TodoListId) {}

  public getId() {
    return this.id;
  }
}
