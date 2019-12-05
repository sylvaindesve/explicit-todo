import { AggregateHandleEvent } from "ts-eventsourcing/EventSourcing/AggregateHandleEvent";
import { EventSourcedAggregateRoot } from "ts-eventsourcing/EventSourcing/EventSourcedAggregateRoot";
import { EventSourcedEntity } from "ts-eventsourcing/EventSourcing/EventSourcedEntity";
import { UuidIdentity } from "ts-eventsourcing/ValueObject/UuidIdentity";
import {
  TodoItemAdded,
  TodoItemDone,
  TodoListCreated,
  TodoListNameChanged
} from "./event";
import { TodoItem } from "./TodoItem";
import { TodoItemDescription } from "./TodoItemDescription";
import { TodoItemId } from "./TodoItemId";
import { TodoListId } from "./TodoListId";
import { TodoListName } from "./TodoListName";

export class TodoList extends EventSourcedAggregateRoot<TodoListId> {
  public static create(id: TodoListId) {
    const newTodoList = new TodoList(id);
    newTodoList.apply(new TodoListCreated());
    return newTodoList;
  }

  private _name: TodoListName = new TodoListName("");
  private _items: TodoItem[] = [];

  public getName(): TodoListName {
    return this._name;
  }

  public setName(name: TodoListName) {
    this.apply(new TodoListNameChanged(name.getName()));
  }

  public addItem(idItem: TodoItemId, description: TodoItemDescription) {
    this.apply(
      new TodoItemAdded(idItem.toString(), description.getDescription())
    );
  }

  public markItemDone(idItem: TodoItemId) {
    this.apply(new TodoItemDone(idItem.toString()));
  }

  public getItems(): TodoItem[] {
    return this._items;
  }

  protected getChildEntities(): Array<EventSourcedEntity<any>> {
    return this._items;
  }

  @AggregateHandleEvent
  protected applyNameChanged(event: TodoListNameChanged) {
    this._name = new TodoListName(event.name);
  }

  @AggregateHandleEvent
  protected applyTodoItemAdded(event: TodoItemAdded) {
    this._items.push(
      new TodoItem(
        this,
        new UuidIdentity(event.idItem),
        new TodoItemDescription(event.description)
      )
    );
  }
}
