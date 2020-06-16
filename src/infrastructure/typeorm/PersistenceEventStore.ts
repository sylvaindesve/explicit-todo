import { map, mergeMap } from "rxjs/operators";
import { ClassUtil } from "ts-eventsourcing/ClassUtil";
import { DomainEventStream } from "ts-eventsourcing/Domain/DomainEventStream";
import { DomainMessage } from "ts-eventsourcing/Domain/DomainMessage";
import { EventStore } from "ts-eventsourcing/EventStore/EventStore";
import { SerializerInterface } from "ts-eventsourcing/Serializer/SerializerInterface";
import { Identity } from "ts-eventsourcing/ValueObject/Identity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { DomainMessageEntity } from "./DomainMessageEntity";
import { fromQuery } from "./fromQuery";

export class PersistenceEventStore<Id extends Identity>
  implements EventStore<Id> {
  constructor(
    protected readonly repository: Repository<DomainMessageEntity>,
    protected readonly serializer: SerializerInterface
  ) {}

  public load(id: Id): DomainEventStream {
    return this.loadFromPlayhead(id, 0);
  }

  public loadFromPlayhead(id: Id, playhead: number): DomainEventStream {
    const entityQuery = this.repository
      .createQueryBuilder()
      .select()
      .where("playhead >= :playhead")
      .andWhere("aggregateId = :id ")
      .orderBy("id")
      .orderBy("playhead")
      .setParameters({
        id: id.toString(),
        playhead
      });
    return this.wrapQuery(entityQuery);
  }

  public loadAll(): DomainEventStream {
    const entityQuery = this.repository
      .createQueryBuilder()
      .select()
      .orderBy("id")
      .orderBy("playhead");
    return this.wrapQuery(entityQuery);
  }

  public append(id: Identity, eventStream: DomainEventStream): Promise<void> {
    return eventStream
      .pipe(
        mergeMap(async message => {
          // sylvaindesve: Changed to account for modifications in DomainMessageEntity
          const entity = new DomainMessageEntity();
          entity.aggregateId = id.toString();
          entity.serializedAggregateId = this.serializer.serialize(
            message.aggregateId
          );
          entity.eventName = ClassUtil.nameOff(message.payload);
          entity.playhead = message.playhead;
          entity.payload = this.serializer.serialize(message.payload);
          entity.recordedOn = message.recordedOn.getTime();
          entity.metadata = this.serializer.serialize(message.metadata);
          await this.repository.save(entity);
          message.metadata.eventId = entity.id;
        })
      )
      .toPromise();
  }

  public async has(id: Id): Promise<boolean> {
    return (await this.repository.count({ where: { id }, take: 1 })) === 1;
  }

  protected convertToDomainMessage(
    entity: DomainMessageEntity
  ): DomainMessage<Id> {
    const metadata: any = this.serializer.deserialize(entity.metadata);
    metadata.eventId = entity.id;
    return new DomainMessage(
      this.serializer.deserialize(entity.serializedAggregateId) as any,
      entity.playhead,
      this.serializer.deserialize(entity.payload) as any,
      new Date(entity.recordedOn),
      metadata
    );
  }

  protected wrapQuery(entityQuery: SelectQueryBuilder<DomainMessageEntity>) {
    return fromQuery(entityQuery).pipe(
      map(entity => this.convertToDomainMessage(entity))
    );
  }
}
