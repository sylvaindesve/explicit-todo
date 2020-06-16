// https://gitlab.com/epinxteren/ts-eventsourcing/-/blob/master/src/EventStore/TypeOrm/DomainMessageEntity.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// sylvaindesve: Changed to have an empty constructor, see https://github.com/typeorm/typeorm/issues/3445
@Entity()
export class DomainMessageEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  public readonly id?: number;

  @Column({ type: "text" })
  public aggregateId: string;

  @Column({ type: "text" })
  public serializedAggregateId: string;

  @Column({ type: "text" })
  public eventName: string;

  @Column({ type: "int" })
  public playhead: number;

  @Column({ type: "longtext" })
  public payload: string;

  @Column({ type: "bigint" })
  public recordedOn: number;

  @Column({ type: "longtext" })
  public metadata: string;
}
