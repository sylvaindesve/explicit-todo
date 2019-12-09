// Always import from this file as it manages import order
// See https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de

export { ValueObject } from "./ValueObject";

export { TodoDomainError } from "./domain/error/TodoDomainError";

// Import events first so that the @AggregateHandleEvent decorator works as expected
export { TodoListCreated } from "./domain/event/TodoListCreated";
export { TodoListNameChanged } from "./domain/event/TodoListNameChanged";
export { TodoListArchived } from "./domain/event/TodoListArchived";
export { TodoItemAdded } from "./domain/event/TodoItemAdded";
export { TodoItemDone } from "./domain/event/TodoItemDone";

export { TodoListId } from "./domain/TodoListId";
export { TodoListName } from "./domain/TodoListName";
export { TodoList } from "./domain/TodoList";

export { TodoItemId } from "./domain/TodoItemId";
export { TodoItemDescription } from "./domain/TodoItemDescription";
export { TodoItemStatus } from "./domain/TodoItemStatus";
export { TodoItem } from "./domain/TodoItem";

export { IsTodoListNameValid } from "./domain/rules/IsTodoListNameValid";
export { IsTodoItemDescriptionValid } from "./domain/rules/IsTodoItemDescriptionValid";
export { TodoListCanBeArchived } from "./domain/rules/TodoListCanBeArchived";

export { TodoApp } from "./TodoApp";

export { Notification } from "./command/Notification";
export { CreateTodoList } from "./command/CreateTodoList";
export { RenameTodoList } from "./command/RenameTodoList";
export { ArchiveTodoList } from "./command/ArchiveTodoList";
export { AddItemToTodoList } from "./command/AddItemToTodoList";
export { MarkItemDone } from "./command/MarkItemDone";
export { TodoListCommandHandler } from "./command/TodoListCommandHandler";

export { TodoListReadModel } from "./read/TodoListReadModel";
export { TodoListReadModelRepository } from "./read/TodoListReadModelRepository";
export { TodoListProjector } from "./read/TodoListProjector";

export { GetAllTodoLists } from "./query/GetAllTodoLists";
export { TodoListQueryHandler } from "./query/TodoListQueryHandler";
