import { AggregateHandleEvent } from "ts-eventsourcing/EventSourcing/AggregateHandleEvent";
import { EventSourcedEntity } from "ts-eventsourcing/EventSourcing/EventSourcedEntity";
import {
  TodoItemDescription,
  TodoItemDone,
  TodoItemId,
  TodoItemStatus,
  TodoList
} from "..";

export class TodoItem extends EventSourcedEntity<TodoList> {
  private _id: TodoItemId;
  private _description: TodoItemDescription = new TodoItemDescription("");
  private _status: TodoItemStatus = TodoItemStatus.TODO;

  constructor(
    root: TodoList,
    id: TodoItemId,
    description: TodoItemDescription
  ) {
    super(root);
    this._id = id;
    this._description = description;
  }

  public getId(): TodoItemId {
    return this._id;
  }

  public getStatus(): TodoItemStatus {
    return this._status;
  }

  @AggregateHandleEvent
  protected handleTodoItemDone(event: TodoItemDone) {
    if (this._id.equals(new TodoItemId(event.idItem))) {
      this._status = TodoItemStatus.DONE;
    }
  }
}
