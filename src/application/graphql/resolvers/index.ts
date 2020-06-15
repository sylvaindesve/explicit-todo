import { toArray } from "rxjs/operators";
import {
  AbandonItem,
  AddItemToTodoList,
  ArchiveTodoList,
  CreateTodoList,
  GetAllTodoLists,
  GetTodoList,
  MarkItemDone,
  Notification,
  RenameTodoList,
  TodoItemId,
  TodoListId
} from "../../../todo";
import { TodoAppGraphQLServerContext } from "../TodoAppGraphQLServerContext";

export const resolvers = {
  Mutation: {
    abandonItem: async (
      _root: any,
      { id, itemId }: { id: string; itemId: string },
      context: TodoAppGraphQLServerContext
    ) => {
      const not: Notification = await context.todoApp
        .getCommandBus()
        .dispatch(new AbandonItem(id, itemId));
      if (not.hasErrors()) {
        throw new Error(
          `Can't abandon item : ${Array.from(not.getErrors().values()).join(
            ", "
          )}`
        );
      } else {
        return context.todoApp.getQueryBus().dispatch(new GetTodoList(id));
      }
    },

    addItemToTodoList: async (
      _root: any,
      { id, description }: { id: string; description: string },
      context: TodoAppGraphQLServerContext
    ) => {
      const newItemId = TodoItemId.create();
      const not: Notification = await context.todoApp
        .getCommandBus()
        .dispatch(new AddItemToTodoList(id, newItemId.toString(), description));
      if (not.hasErrors()) {
        throw new Error(
          `Can't add item to TodoList : ${Array.from(
            not.getErrors().values()
          ).join(", ")}`
        );
      } else {
        return context.todoApp.getQueryBus().dispatch(new GetTodoList(id));
      }
    },

    archiveTodoList: async (
      _root: any,
      { id }: { id: string },
      context: TodoAppGraphQLServerContext
    ) => {
      const not: Notification = await context.todoApp
        .getCommandBus()
        .dispatch(new ArchiveTodoList(id));
      if (not.hasErrors()) {
        throw new Error(
          `Can't archive TodoList : ${Array.from(not.getErrors().values()).join(
            ", "
          )}`
        );
      } else {
        return true;
      }
    },

    createTodoList: async (
      _root: any,
      { name }: { name: string },
      context: TodoAppGraphQLServerContext
    ) => {
      const newTodoListId = TodoListId.create();
      const not: Notification = await context.todoApp
        .getCommandBus()
        .dispatch(new CreateTodoList(newTodoListId.toString(), name));
      if (not.hasErrors()) {
        throw new Error(
          `Can't create TodoList : ${Array.from(not.getErrors().values()).join(
            ", "
          )}`
        );
      } else {
        return context.todoApp
          .getQueryBus()
          .dispatch(new GetTodoList(newTodoListId.toString()));
      }
    },

    markItemDone: async (
      _root: any,
      { id, itemId }: { id: string; itemId: string },
      context: TodoAppGraphQLServerContext
    ) => {
      const not: Notification = await context.todoApp
        .getCommandBus()
        .dispatch(new MarkItemDone(id, itemId));
      if (not.hasErrors()) {
        throw new Error(
          `Can't mark item as done : ${Array.from(
            not.getErrors().values()
          ).join(", ")}`
        );
      } else {
        return context.todoApp.getQueryBus().dispatch(new GetTodoList(id));
      }
    },

    renameTodoList: async (
      _root: any,
      { id, newName }: { id: string; newName: string },
      context: TodoAppGraphQLServerContext
    ) => {
      const not: Notification = await context.todoApp
        .getCommandBus()
        .dispatch(new RenameTodoList(id, newName));
      if (not.hasErrors()) {
        throw new Error(
          `Can't rename TodoList : ${Array.from(not.getErrors().values()).join(
            ", "
          )}`
        );
      } else {
        return context.todoApp.getQueryBus().dispatch(new GetTodoList(id));
      }
    }
  },
  Query: {
    todoList: (
      _root: any,
      { id }: { id: string },
      context: TodoAppGraphQLServerContext
    ) => {
      return context.todoApp.getQueryBus().dispatch(new GetTodoList(id));
    },

    todoLists: async (
      _root: any,
      _args: any,
      context: TodoAppGraphQLServerContext
    ) => {
      const lists$ = await context.todoApp
        .getQueryBus()
        .dispatch(new GetAllTodoLists());
      return lists$.pipe(toArray()).toPromise();
    }
  },

  TodoItem: {
    id: (todoItem: any) => todoItem.id.toString()
  },
  TodoList: {
    id: (todoList: any) => todoList.id.toString()
  }
};
