import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import { TodoListReadModel } from "..";

export interface TodoListReadModelRepository
  extends Repository<TodoListReadModel> {}
