import { CommandHandler } from "ts-eventsourcing/CommandHandling/CommandHandler";
import { HandleCommand } from "ts-eventsourcing/CommandHandling/HandleCommand";
import { EventSourcingRepositoryInterface } from "ts-eventsourcing/EventSourcing/EventSourcingRepositoryInterface";
import {
  AbandonItem,
  AddItemToTodoList,
  ArchiveTodoList,
  CreateTodoList,
  IsTodoItemDescriptionValid,
  IsTodoListNameValid,
  MarkItemDone,
  Notification,
  RenameTodoList,
  TodoItemDescription,
  TodoItemId,
  TodoList,
  TodoListCanBeArchived,
  TodoListId,
  TodoListName
} from "..";

export class TodoListCommandHandler implements CommandHandler {
  private _repository: EventSourcingRepositoryInterface<TodoList>;

  constructor(repository: EventSourcingRepositoryInterface<TodoList>) {
    this._repository = repository;
  }

  @HandleCommand
  public async handlerCreateTodoList(
    command: CreateTodoList
  ): Promise<Notification> {
    const not = new Notification();
    const id = this.validateTodoListId(command.id, not);

    this.validateTodoListName(command.name, not);

    if (id && !not.hasErrors()) {
      const todoList = TodoList.create(id);
      todoList.setName(new TodoListName(command.name));
      await this._repository.save(todoList);
    }

    return not;
  }

  @HandleCommand
  public async handleRenameTodoList(
    command: RenameTodoList
  ): Promise<Notification> {
    const not = new Notification();
    const id = this.validateTodoListId(command.id, not);

    if (id) {
      this.validateTodoListExists(id, not);
    }
    this.validateTodoListName(command.name, not);

    if (id && !not.hasErrors()) {
      const todoList = await this._repository.load(id);
      todoList.setName(new TodoListName(command.name));
      await this._repository.save(todoList);
    }

    return not;
  }

  @HandleCommand
  public async handleArchiveTodoList(
    command: ArchiveTodoList
  ): Promise<Notification> {
    const not = new Notification();
    const id = this.validateTodoListId(command.id, not);

    if (id) {
      this.validateTodoListExists(id, not);
    }

    if (id && !not.hasErrors()) {
      const todoList = await this._repository.load(id);
      const canBeArchived = new TodoListCanBeArchived();
      if (canBeArchived.satisfiedBy(todoList)) {
        todoList.archive();
        await this._repository.save(todoList);
      } else {
        not.addError("id", canBeArchived.explanation());
      }
    }

    return not;
  }

  @HandleCommand
  public async handleAddItemToTodoList(
    command: AddItemToTodoList
  ): Promise<Notification> {
    const not = new Notification();
    const id = this.validateTodoListId(command.id, not);
    const itemId = this.validateTodoListId(command.itemId, not);

    if (id) {
      this.validateTodoListExists(id, not);
    }
    this.validateTodoItemDescription(command.description, not);

    if (id && itemId && !not.hasErrors()) {
      const todoList = await this._repository.load(id);
      todoList.addItem(itemId, new TodoItemDescription(command.description));
      await this._repository.save(todoList);
    }

    return not;
  }

  @HandleCommand
  public async handleMarkItemDone(command: MarkItemDone) {
    const not = new Notification();
    const id = this.validateTodoListId(command.id, not);
    const itemId = this.validateTodoItemId(command.itemId, not);

    if (id) {
      this.validateTodoListExists(id, not);
    }

    if (id && itemId && !not.hasErrors()) {
      const todoList = await this._repository.load(id);
      todoList.markItemDone(itemId);
      await this._repository.save(todoList);
    }

    return not;
  }

  @HandleCommand
  public async handleAbandonItem(command: AbandonItem) {
    const not = new Notification();
    const id = this.validateTodoListId(command.id, not);
    const itemId = this.validateTodoItemId(command.itemId, not);

    if (id) {
      this.validateTodoListExists(id, not);
    }

    if (id && itemId && !not.hasErrors()) {
      const todoList = await this._repository.load(id);
      todoList.abandonItem(itemId);
      await this._repository.save(todoList);
    }

    return not;
  }

  private validateTodoListId(
    id: string,
    notification: Notification
  ): TodoListId | null {
    let todoListId: TodoListId | null = null;
    try {
      todoListId = new TodoListId(id);
    } catch (e) {
      notification.addError("id", "Not a valid todo list ID");
    }
    return todoListId;
  }

  private validateTodoItemId(
    idItem: string,
    notification: Notification
  ): TodoItemId | null {
    let todoListId: TodoItemId | null = null;
    try {
      todoListId = new TodoItemId(idItem);
    } catch (e) {
      notification.addError("itemId", "Not a valid todo item ID");
    }
    return todoListId;
  }

  private async validateTodoListExists(
    id: TodoListId,
    notification: Notification
  ): Promise<void> {
    if (await !this._repository.has(id)) {
      notification.addError("id", `Todo list with ID ${id} does not exist.`);
    }
  }

  private validateTodoListName(name: string, notification: Notification): void {
    const isNameValid = new IsTodoListNameValid();
    if (!isNameValid.satisfiedBy(name)) {
      notification.addError("name", isNameValid.explanation());
    }
  }

  private validateTodoItemDescription(
    description: string,
    notification: Notification
  ): void {
    const isDescriptionValid = new IsTodoItemDescriptionValid();
    if (!isDescriptionValid.satisfiedBy(description)) {
      notification.addError("description", isDescriptionValid.explanation());
    }
  }
}
