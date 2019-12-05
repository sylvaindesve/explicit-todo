import { TodoItemAdded, TodoItemDone } from "todo/domain/event";
import { DomainMessage } from "ts-eventsourcing/Domain/DomainMessage";
import { HandleDomainEvent } from "ts-eventsourcing/EventHandling/HandleDomainEvent";
import { Projector } from "ts-eventsourcing/ReadModel/Projector";
import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import { TodoListCreated } from "../domain/event/TodoListCreated";
import { TodoListNameChanged } from "../domain/event/TodoListNameChanged";
import { TodoListId } from "../domain/TodoListId";
import { TodoListReadModel } from "./TodoListReadModel";

export class TodoListProjector implements Projector {
  constructor(private readonly repository: Repository<TodoListReadModel>) {}

  @HandleDomainEvent
  public async todoListCreated(
    _event: TodoListCreated,
    message: DomainMessage<TodoListCreated, TodoListId>
  ) {
    const model = new TodoListReadModel(message.aggregateId);
    await this.repository.save(model);
  }

  @HandleDomainEvent
  public async todoListNameChanged(
    _event: TodoListNameChanged,
    message: DomainMessage<TodoListNameChanged, TodoListId>
  ) {
    const model = await this.repository.get(message.aggregateId);
    model.name = _event.name;
    await this.repository.save(model);
  }

  @HandleDomainEvent
  public async todoItemAdded(
    _event: TodoItemAdded,
    message: DomainMessage<TodoItemAdded, TodoListId>
  ) {
    const model = await this.repository.get(message.aggregateId);
    model.items.push({
      description: _event.description,
      done: false,
      id: _event.idItem
    });
    await this.repository.save(model);
  }

  @HandleDomainEvent
  public async todoItemDone(
    _event: TodoItemDone,
    message: DomainMessage<TodoItemDone, TodoListId>
  ) {
    const model = await this.repository.get(message.aggregateId);
    model.items.find(item => item.id === _event.idItem)!.done = true;
    await this.repository.save(model);
  }
}
