import { AggregateHandleEvent } from "ts-eventsourcing/EventSourcing/AggregateHandleEvent";
import { EventSourcedAggregateRoot } from "ts-eventsourcing/EventSourcing/EventSourcedAggregateRoot";
import { EventSourcedEntity } from "ts-eventsourcing/EventSourcing/EventSourcedEntity";
import { UuidIdentity } from "ts-eventsourcing/ValueObject/UuidIdentity";
import {
  TodoDomainError,
  TodoItem,
  TodoItemAdded,
  TodoItemDescription,
  TodoItemDone,
  TodoItemId,
  TodoListArchived,
  TodoListCanBeArchived,
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

  public getItems(): TodoItem[] {
    return this._items;
  }

  public isArchived(): boolean {
    return this._isArchived;
  }

  public archive(): void {
    const canBeArchived = new TodoListCanBeArchived();
    if (canBeArchived.satisfiedBy(this)) {
      this.apply(new TodoListArchived());
    } else {
      throw new TodoDomainError(
        "Cannot archive list : " + canBeArchived.explanation()
      );
    }
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
  protected applyArchived(_event: TodoListArchived) {
    this._isArchived = true;
  }
}
