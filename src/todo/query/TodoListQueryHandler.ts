import { Observable } from 'rxjs';
import { HandleQuery } from 'ts-eventsourcing/QueryHandling/HandleQuery';
import { QueryHandler } from 'ts-eventsourcing/QueryHandling/QueryHandler';
import { TodoListReadModel } from '../read/TodoListReadModel';
import { TodoListReadModelRepository } from '../read/TodoListReadModelRepository';
import { GetAllTodoLists } from './GetAllTodoLists';

export class TodoListQueryHandler implements QueryHandler {

  constructor(
    private readonly repository: TodoListReadModelRepository,
  ) {}

  @HandleQuery
  public getAllTodoLists(query: GetAllTodoLists): Observable<TodoListReadModel> {
    return this.repository.findAll();
  }

}
