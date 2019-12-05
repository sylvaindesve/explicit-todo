import { CommandHandler } from "ts-eventsourcing/CommandHandling/CommandHandler";
import { HandleCommand } from "ts-eventsourcing/CommandHandling/HandleCommand";
import { EventSourcingRepositoryInterface } from "ts-eventsourcing/EventSourcing/EventSourcingRepositoryInterface";
import { TodoItemDescription } from "../domain/TodoItemDescription";
import { TodoItemId } from "../domain/TodoItemId";
import { TodoList } from "../domain/TodoList";
import { TodoListId } from "../domain/TodoListId";
import { TodoListName } from "../domain/TodoListName";
import { AddItemToTodoList } from "./AddItemToTodoList";
import { CreateTodoList } from "./CreateTodoList";
import { MarkItemDone } from "./MarkItemDone";
import { Notification } from "./Notification";
import { RenameTodoList } from "./RenameTodoList";

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
      todoList.setName(new TodoListName(command.name)),
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
      todoList.setName(new TodoListName(command.name)),
        await this._repository.save(todoList);
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
    const itemId = this.validateTodoListId(command.itemId, not);

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
    if (name.length === 0) {
      notification.addError("name", "Name must not be empty.");
    }
    if (name.length > 100) {
      notification.addError(
        "name",
        "Name must not be longer than 100 characters."
      );
    }
  }

  private validateTodoItemDescription(
    description: string,
    notification: Notification
  ): void {
    if (description.length === 0) {
      notification.addError("description", "Description must not be empty.");
    }
    if (description.length > 100) {
      notification.addError(
        "description",
        "Description must not be longer than 100 characters."
      );
    }
  }
}
