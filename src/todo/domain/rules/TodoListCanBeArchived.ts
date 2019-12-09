import { TodoItemStatus, TodoList } from "../..";
import { AbstractSpecification } from "../../../utils/specification";

export class TodoListCanBeArchived extends AbstractSpecification<TodoList> {
  public explanation(): string {
    return "Cannot be archived unless all items are done (or it has no items)";
  }

  public satisfiedBy(target: TodoList): boolean {
    return target
      .getItems()
      .every(item => item.getStatus() === TodoItemStatus.DONE);
  }
}
