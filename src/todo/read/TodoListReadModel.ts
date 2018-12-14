import { ReadModel } from 'ts-eventsourcing/ReadModel/ReadModel';
import { TodoListId } from '../domain/TodoListId';

export class TodoListReadModel implements ReadModel<TodoListId> {

  public name: string = '';

  constructor(
    public readonly id: TodoListId,
  ) {}

  public getId() {
    return this.id;
  }

}
