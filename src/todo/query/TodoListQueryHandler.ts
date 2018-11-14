import { HandleQuery } from "ts-eventsourcing/QueryHandling/HandleQuery";
import { QueryHandler } from "ts-eventsourcing/QueryHandling/QueryHandler";
import { TodoListReadModel } from "../read/TodoListReadModel";
import { TodoListReadModelRepository } from "../read/TodoListReadModelRepository";
import { GetAllTodoLists } from "./GetAllTodoLists";

export class TodoListQueryHandler implements QueryHandler {

  constructor(
    private readonly repository: TodoListReadModelRepository,
  ) {}

  @HandleQuery
  public async getAllTodoLists(query: GetAllTodoLists): Promise<TodoListReadModel[]> {
    return await this.repository.findAll();
  }

}
