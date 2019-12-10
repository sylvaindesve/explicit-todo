import { DomainMessage } from "ts-eventsourcing/Domain/DomainMessage";
import { HandleDomainEvent } from "ts-eventsourcing/EventHandling/HandleDomainEvent";
import { Projector } from "ts-eventsourcing/ReadModel/Projector";
import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import { StatsReadModel, TodoListCreated, TodoListId } from "..";
import { STATS_GLOBAL_ID } from "./StatsReadModel";

export class StatsProjector implements Projector {
  constructor(private readonly repository: Repository<StatsReadModel>) {}

  @HandleDomainEvent
  public async todoListCreated(
    _event: TodoListCreated,
    _message: DomainMessage<TodoListCreated, TodoListId>
  ) {
    const statsModelExists = await this.repository.has(STATS_GLOBAL_ID);
    if (!statsModelExists) {
      await this.repository.save(new StatsReadModel(STATS_GLOBAL_ID));
    }
    const model = await this.repository.get(STATS_GLOBAL_ID);
    model.incrementNumberOfListsCreated();
    await this.repository.save(model);
  }
}
