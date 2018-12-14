import { CommandBus } from 'ts-eventsourcing/CommandHandling/CommandBus';
import { SimpleCommandBus } from 'ts-eventsourcing/CommandHandling/SimpleCommandBus';
import { DomainEventBus } from 'ts-eventsourcing/EventHandling/DomainEventBus';
import { AsynchronousDomainEventBus } from 'ts-eventsourcing/EventHandling/DomainEventBus/AsynchronousDomainEventBus';
import { EventSourcingRepositoryInterface } from 'ts-eventsourcing/EventSourcing/EventSourcingRepositoryInterface';
// tslint:disable-next-line:max-line-length
import { SimpleEventSourcedAggregateFactory } from 'ts-eventsourcing/EventSourcing/Factory/SimpleEventSourcedAggregateFactory';
import { EventSourcingRepository } from 'ts-eventsourcing/EventSourcing/Repository/EventSourcingRepository';
import { EventStore } from 'ts-eventsourcing/EventStore/EventStore';
import { QueryBus } from 'ts-eventsourcing/QueryHandling/QueryBus';
import { SimpleQueryBus } from 'ts-eventsourcing/QueryHandling/SimpleQueryBus';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';
import { TodoListCommandHandler } from './command';
import { TodoList, TodoListId } from './domain';
import { TodoListQueryHandler } from './query';
import { TodoListProjector, TodoListReadModelRepository } from './read';

export class TodoApp {

  private _commandBus: CommandBus;
  private _todoListCommandHandler: TodoListCommandHandler;

  private _queryBus: QueryBus;
  private _todoListQueryHandler: TodoListQueryHandler;
  private _todoListRepository: TodoListReadModelRepository;

  private _eventBus: DomainEventBus;

  private _eventStore: EventStore<Identity>;
  private _todoListEventSourcingRepository: EventSourcingRepositoryInterface<TodoList, TodoListId>;

  constructor(eventStore: EventStore<Identity>, todoListRepository: TodoListReadModelRepository) {
    this._eventStore = eventStore;
    this._todoListRepository = todoListRepository;

    this._commandBus = new SimpleCommandBus();
    this._queryBus = new SimpleQueryBus();
    this._eventBus = new AsynchronousDomainEventBus();
    this._todoListEventSourcingRepository = new EventSourcingRepository<TodoList, TodoListId>(
      this._eventStore,
      this._eventBus,
      new SimpleEventSourcedAggregateFactory(TodoList),
    );

    this._todoListCommandHandler = new TodoListCommandHandler(this._todoListEventSourcingRepository);
    this._commandBus.subscribe(this._todoListCommandHandler);

    this._todoListQueryHandler = new TodoListQueryHandler(this._todoListRepository);
    this._queryBus.subscribe(this._todoListQueryHandler);

    this._eventBus.subscribe(new TodoListProjector(this._todoListRepository));
  }

  public getCommandBus(): CommandBus {
    return this._commandBus;
  }

  public getQueryBus(): QueryBus {
    return this._queryBus;
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
