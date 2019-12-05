import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import { TodoListReadModel } from "./TodoListReadModel";

export interface TodoListReadModelRepository
  extends Repository<TodoListReadModel> {}
