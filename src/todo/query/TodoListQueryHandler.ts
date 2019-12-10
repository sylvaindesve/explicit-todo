import { Observable } from "rxjs";
import { HandleQuery } from "ts-eventsourcing/QueryHandling/HandleQuery";
import { QueryHandler } from "ts-eventsourcing/QueryHandling/QueryHandler";
import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import {
  GetAllTodoLists,
  GetTodoList,
  TodoListId,
  TodoListReadModel
} from "..";

export class TodoListQueryHandler implements QueryHandler {
  constructor(private readonly repository: Repository<TodoListReadModel>) {}

  @HandleQuery
  public getAllTodoLists(
    _query: GetAllTodoLists
  ): Observable<TodoListReadModel> {
    return this.repository.findAll();
  }

  @HandleQuery
  public getTodoList(query: GetTodoList): Promise<TodoListReadModel | null> {
    const todoListId = new TodoListId(query.id);
    return this.repository.find(todoListId);
  }
}
