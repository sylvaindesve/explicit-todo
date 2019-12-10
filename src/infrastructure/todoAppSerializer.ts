import { createClassHandlers } from "ts-eventsourcing/Serializer/transit-js/createClassHandlers";
import { TransitJSSerializer } from "ts-eventsourcing/Serializer/transit-js/TransitJSSerializer";
import {
  StatsReadModel,
  StatsReadModelId,
  TodoItemAbandonned,
  TodoItemAdded,
  TodoItemDone,
  TodoItemId,
  TodoListArchived,
  TodoListCreated,
  TodoListId,
  TodoListNameChanged,
  TodoListReadModel
} from "../todo";

const todoListIdSerializerInterface = {
  class: TodoListId,
  read: (data: any): any => {
    return new TodoListId(data.id);
  },
  tag: "TodoListId",
  write: (instance: any): any => {
    return { id: instance.id };
  }
};

const todoItemIdSerializerInterface = {
  class: TodoItemId,
  read: (data: any): any => {
    return new TodoItemId(data.id);
  },
  tag: "TodoItemId",
  write: (instance: any): any => {
    return { id: instance.id };
  }
};

const statsReadModelIdSerializerInterface = {
  class: StatsReadModelId,
  read: (data: any): any => {
    return new StatsReadModelId(data.id);
  },
  tag: "StatsReadModelId",
  write: (instance: any): any => {
    return { id: instance.id };
  }
};

const classHandlers: any[] = createClassHandlers({
  StatsReadModel,
  TodoItemAbandonned,
  TodoItemAdded,
  TodoItemDone,
  TodoItemId,
  TodoListArchived,
  TodoListCreated,
  TodoListNameChanged,
  TodoListReadModel
});

export const todoAppSerializer = new TransitJSSerializer(
  [],
  [
    todoListIdSerializerInterface,
    todoItemIdSerializerInterface,
    statsReadModelIdSerializerInterface
  ].concat(classHandlers)
);
