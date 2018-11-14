import { CommandBus } from "ts-eventsourcing/CommandHandling/CommandBus";
import { SimpleCommandBus } from "ts-eventsourcing/CommandHandling/SimpleCommandBus";
import { DomainEventBus } from "ts-eventsourcing/EventHandling/DomainEventBus";
import { AsynchronousDomainEventBus } from "ts-eventsourcing/EventHandling/DomainEventBus/AsynchronousDomainEventBus";
import { EventSourcingRepositoryInterface } from "ts-eventsourcing/EventSourcing/EventSourcingRepositoryInterface";
// tslint:disable-next-line:max-line-length
import { SimpleEventSourcedAggregateFactory } from "ts-eventsourcing/EventSourcing/Factory/SimpleEventSourcedAggregateFactory";
import { EventSourcingRepository } from "ts-eventsourcing/EventSourcing/Repository/EventSourcingRepository";
import { EventStore } from "ts-eventsourcing/EventStore/EventStore";
import { Identity } from "ts-eventsourcing/ValueObject/Identity";
import { TodoListCommandHandler } from "./command/TodoListCommandHandler";
import { TodoList } from "./domain/TodoList";
import { TodoListId } from "./domain/TodoListId";
import { TodoListProjector } from "./read/TodoListProjector";
import { TodoListReadModelRepository } from "./read/TodoListReadModelRepository";

export class TodoApp {

  private _commandBus: CommandBus;
  private _eventBus: DomainEventBus;
  private _eventStore: EventStore<Identity>;
  private _todoListEventSourcingRepository: EventSourcingRepositoryInterface<TodoList, TodoListId>;
  private _todoListCommandHandler: TodoListCommandHandler;
  private _todoListRepository: TodoListReadModelRepository;

  constructor(eventStore: EventStore<Identity>, todoListRepository: TodoListReadModelRepository) {
    this._eventStore = eventStore;
    this._todoListRepository = todoListRepository;

    this._commandBus = new SimpleCommandBus();
    this._eventBus = new AsynchronousDomainEventBus();
    this._todoListEventSourcingRepository = new EventSourcingRepository<TodoList, TodoListId>(
      this._eventStore,
      this._eventBus,
      new SimpleEventSourcedAggregateFactory(TodoList),
    );
    this._todoListCommandHandler = new TodoListCommandHandler(this._todoListEventSourcingRepository);
    this._commandBus.subscribe(this._todoListCommandHandler);
    this._eventBus.subscribe(new TodoListProjector(this._todoListRepository));
  }

  public getCommandBus(): CommandBus {
    return this._commandBus;
  }

  public getEventBus(): DomainEventBus {
    return this._eventBus;
  }

  public getEventStore(): EventStore<Identity> {
    return this._eventStore;
  }

  public getTodoListEventSourcingRepository(): EventSourcingRepositoryInterface<TodoList, TodoListId> {
    return this._todoListEventSourcingRepository;
  }

  public getTodoListRepository(): TodoListReadModelRepository {
    return this._todoListRepository;
  }

}
