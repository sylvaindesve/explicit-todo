import { Observable } from "rxjs";
import { HandleQuery } from "ts-eventsourcing/QueryHandling/HandleQuery";
import { QueryHandler } from "ts-eventsourcing/QueryHandling/QueryHandler";
import {
  GetAllTodoLists,
  TodoListReadModel,
  TodoListReadModelRepository
} from "..";

export class TodoListQueryHandler implements QueryHandler {
  constructor(private readonly repository: TodoListReadModelRepository) {}

  @HandleQuery
  public getAllTodoLists(
    query: GetAllTodoLists
  ): Observable<TodoListReadModel> {
    return this.repository.findAll();
  }
}
