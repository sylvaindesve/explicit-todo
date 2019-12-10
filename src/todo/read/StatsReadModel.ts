import { ReadModel } from "ts-eventsourcing/ReadModel/ReadModel";
import { ScalarIdentity } from "ts-eventsourcing/ValueObject/ScalarIdentity";
import { StatsReadModelId } from "..";

export const STATS_GLOBAL_ID = new StatsReadModelId("global");

export class StatsReadModel implements ReadModel<StatsReadModelId> {
  private _number_of_lists_created: number = 0;

  constructor(public readonly id: ScalarIdentity<string>) {}

  public getId() {
    return this.id;
  }

  public getNumberOfListsCreated(): number {
    return this._number_of_lists_created;
  }

  public incrementNumberOfListsCreated(): void {
    this._number_of_lists_created += 1;
  }
}
