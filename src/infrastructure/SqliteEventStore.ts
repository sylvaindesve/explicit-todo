import { from, Observable } from "rxjs";
import { flatMap, map, mergeAll } from "rxjs/operators";
import { Database, open } from "sqlite";
import { ClassUtil } from "ts-eventsourcing/ClassUtil";
import { DomainEvent } from "ts-eventsourcing/Domain/DomainEvent";
import { DomainEventStream } from "ts-eventsourcing/Domain/DomainEventStream";
import { DomainMessage } from "ts-eventsourcing/Domain/DomainMessage";
import { EventStore } from "ts-eventsourcing/EventStore/EventStore";
import { Identity } from "ts-eventsourcing/ValueObject/Identity";
import { UuidIdentity } from "ts-eventsourcing/ValueObject/UuidIdentity";
import { TodoListCreated } from "../todo/domain/event/TodoListCreated";
import { TodoListNameChanged } from "../todo/domain/event/TodoListNameChanged";

export class SqliteEventStore<Id extends Identity = Identity> implements EventStore<Id> {

  private _databaseFile: string;
  private _database: null | Database = null;

  constructor(databaseFile: string) {
    this._databaseFile = databaseFile;
  }

  public async has(id: Id): Promise<boolean> {
    const db = await this.getDatabase();
    const result: any = await db.get(`SELECT * FROM events WHERE aggregateId = "${id.toString()}"`);
    return result !== undefined;
  }

  public load(id: Id): DomainEventStream {
    return this.getEvents(`SELECT * FROM events WHERE aggregateId = "${id.toString()}"`);
  }

  public loadAll(): DomainEventStream {
    return this.getEvents("SELECT * FROM events");
  }

  public loadFromPlayhead(id: Id, playhead: number): DomainEventStream {
    return this.getEvents(`SELECT * FROM events
      WHERE aggregateId = "${id.toString()} AND playhead >= ${playhead}"`);
  }

  public async append(id: Id, eventStream: DomainEventStream): Promise<void> {
    const db = await this.getDatabase();
    eventStream.subscribe((dm) => {
      db.run(`INSERT INTO events(aggregateId, playhead, eventType, payload, recordOn)
        VALUES(?, ?, ?, ?, ?)`, [
          id.toString(),
          dm.playhead,
          ClassUtil.nameOff(dm.payload),
          JSON.stringify(dm.payload),
          JSON.stringify(dm.recordedOn),
        ]);
    });
  }

  private async getDatabase(): Promise<Database> {
    if (!this._database) {
      this._database = await open(this._databaseFile);
      await this._database.run(`CREATE TABLE IF NOT EXISTS events (
       aggregateId TEXT NOT NULL,
       playhead INTEGER NOT NULL,
       eventType TEXT NOT NULL,
       payload TEXT NOT NULL,
       recordOn TEXT NOT NULL
      )`);
    }
    return this._database!;
  }

  private getEvents(query: string): DomainEventStream {
    return from(this.getDatabase()).pipe(
      flatMap((db: Database) => {
        return from(db.all(query));
      }),
      mergeAll(),
      map((row) => {
        const dm = new DomainMessage(
          new UuidIdentity(row.aggregateId),
          row.playhead,
          this.parseDomainEvent(row.eventType, row.payload),
          JSON.parse(row.recordOn),
        );
        return dm;
      }),
    );
  }

  private parseDomainEvent(eventType: string, payload: string): DomainEvent {
    const payloadAsObject: any = JSON.parse(payload);
    switch (eventType) {
      case "TodoListCreated":
        return new TodoListCreated();
      case "TodoListNameChanged":
        return new TodoListNameChanged(payloadAsObject.name);
      default:
        throw new Error(`Unknown event type ${eventType}`);
    }
  }

}
