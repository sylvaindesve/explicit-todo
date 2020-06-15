import * as winston from "winston";
import { TodoApp } from "../../todo";

export interface TodoAppGraphQLServerContext {
  todoApp: TodoApp;
  logger: winston.Logger;
}
