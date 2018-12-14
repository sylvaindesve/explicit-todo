import { DomainMessage } from 'ts-eventsourcing/Domain/DomainMessage';
import { HandleDomainEvent } from 'ts-eventsourcing/EventHandling/HandleDomainEvent';
import { Projector } from 'ts-eventsourcing/ReadModel/Projector';
import { Repository } from 'ts-eventsourcing/ReadModel/Repository';
import { TodoListCreated } from '../domain/event/TodoListCreated';
import { TodoListNameChanged } from '../domain/event/TodoListNameChanged';
import { TodoListId } from '../domain/TodoListId';
import { TodoListReadModel } from './TodoListReadModel';

export class TodoListProjector implements Projector {

  constructor(
    private readonly repository: Repository<TodoListReadModel>,
  ) {}

  @HandleDomainEvent
  public async todoListCreated(_event: TodoListCreated, message: DomainMessage<TodoListCreated, TodoListId>) {
    const model = new TodoListReadModel(message.aggregateId);
    await this.repository.save(model);
  }

  @HandleDomainEvent
  public async todoListNameChanged(_event: TodoListNameChanged, message: DomainMessage<TodoListCreated, TodoListId>) {
    const model = await this.repository.get(message.aggregateId);
    model.name = _event.name;
    await this.repository.save(model);
  }

}
