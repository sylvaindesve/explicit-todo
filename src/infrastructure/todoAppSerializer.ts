import { createClassHandlers } from "ts-eventsourcing/Serializer/transit-js/createClassHandlers";
import { TransitJSSerializer } from "ts-eventsourcing/Serializer/transit-js/TransitJSSerializer";
import {
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

const classHandlers: any[] = createClassHandlers({
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
  [todoListIdSerializerInterface, todoItemIdSerializerInterface].concat(
    classHandlers
  )
);
