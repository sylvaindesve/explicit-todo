import { AggregateHandleEvent } from "ts-eventsourcing/EventSourcing/AggregateHandleEvent";
import { EventSourcedAggregateRoot } from "ts-eventsourcing/EventSourcing/EventSourcedAggregateRoot";
import { EventSourcedEntity } from "ts-eventsourcing/EventSourcing/EventSourcedEntity";
import { UuidIdentity } from "ts-eventsourcing/ValueObject/UuidIdentity";
import {
  TodoItem,
  TodoItemAbandonned,
  TodoItemAdded,
  TodoItemDescription,
  TodoItemDone,
  TodoItemId,
  TodoListArchived,
  TodoListCreated,
  TodoListId,
  TodoListName,
  TodoListNameChanged
} from "..";

export class TodoList extends EventSourcedAggregateRoot<TodoListId> {
  public static create(id: TodoListId) {
    const newTodoList = new TodoList(id);
    newTodoList.apply(new TodoListCreated());
    return newTodoList;
  }

  private _name: TodoListName = new TodoListName("");
  private _items: TodoItem[] = [];
  private _isArchived: boolean = false;

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

  public abandonItem(idItem: TodoItemId) {
    this.apply(new TodoItemAbandonned(idItem.toString()));
  }

  public getItems(): TodoItem[] {
    return this._items;
  }

  public isArchived(): boolean {
    return this._isArchived;
  }

  public archive(): void {
    this.apply(new TodoListArchived());
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

  @AggregateHandleEvent
  protected applyTodoItemAbandonned(event: TodoItemAbandonned) {
    const itemIndex = this._items.findIndex(
      item => item.getId().toString() === event.idItem
    );
    if (itemIndex > -1) {
      this._items.splice(itemIndex, 1);
    }
  }

  @AggregateHandleEvent
  protected applyArchived(_event: TodoListArchived) {
    this._isArchived = true;
  }
}
