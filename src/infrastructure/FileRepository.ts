import * as fs from "fs";
import { InMemoryRepository } from "ts-eventsourcing/ReadModel/InMemoryRepository";
import { ReadModel } from "ts-eventsourcing/ReadModel/ReadModel";
import { SerializerInterface } from "ts-eventsourcing/Serializer/SerializerInterface";
import { Identity } from "ts-eventsourcing/ValueObject/Identity";

export class FileRepository<
  Model extends ReadModel<Id>,
  Id extends Identity = Identity
> extends InMemoryRepository<Model, Id> {
  public constructor(
    protected readonly file: string,
    protected readonly serializer: SerializerInterface,
    protected readonly fileSystem: typeof fs = fs
  ) {
    super();
    this.loadFromFile();
  }

  public save(model: Model): Promise<void> {
    super.save(model);
    this.saveToFile();
    return Promise.resolve();
  }

  public async remove(id: Id): Promise<void> {
    super.remove(id);
    this.saveToFile();
  }

  private loadFromFile() {
    if (!this.fileSystem.existsSync(this.file)) {
      this.fileSystem.writeFileSync(this.file, JSON.stringify({}));
    }
    const serialized: { [identity: string]: string } = JSON.parse(
      this.fileSystem.readFileSync(this.file).toString()
    );
    for (const [idString, serializedModel] of Object.entries(serialized)) {
      this.models[idString] = this.serializer.deserialize(
        serializedModel
      ) as Model;
    }
  }

  private saveToFile() {
    const serialized: { [identity: string]: string } = {};
    for (const [idString, aModel] of Object.entries(this.models)) {
      serialized[idString] = this.serializer.serialize(aModel);
    }
    this.fileSystem.writeFileSync(this.file, JSON.stringify(serialized));
  }
}
