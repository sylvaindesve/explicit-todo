import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ModelNotFoundException } from "ts-eventsourcing/ReadModel/Error/ModelNotFoundException";
import { Repository } from "ts-eventsourcing/ReadModel/Repository";
import { Repository as TypeOrmRepository } from "typeorm";
import * as winston from "winston";
import { TodoListId, TodoListReadModel } from "../../todo";
import { fromQuery } from "./fromQuery";
import { TodoItemEntity } from "./TodoItemEntity";
import { TodoListEntity } from "./TodoListEntity";

export class TodoListRepository
  implements Repository<TodoListReadModel, TodoListId> {
  private _typeOrmRepository: TypeOrmRepository<TodoListEntity>;
  private _logger: winston.Logger;

  constructor(
    typeOrmRepository: TypeOrmRepository<TodoListEntity>,
    logger: winston.Logger
  ) {
    this._typeOrmRepository = typeOrmRepository;
    this._logger = logger;
  }

  public findAll(): Observable<TodoListReadModel> {
    this._logger.debug("TodoListRepository#findAll");
    const query = this._typeOrmRepository
      .createQueryBuilder("list")
      .select()
      .leftJoinAndSelect("list.items", "items")
      .orderBy("list.modelId");
    return fromQuery(query).pipe(map(entity => this.convertToModel(entity)));
  }

  public async remove(id: TodoListId): Promise<void> {
    this._logger.debug(`TodoListRepository#remove(id: ${id})`);
    const entityToRemove = await this._typeOrmRepository
      .createQueryBuilder("list")
      .select()
      .where("list.modelId = :modelId")
      .setParameters({
        modelId: id.toString()
      })
      .getOne();
    if (entityToRemove !== undefined) {
      await this._typeOrmRepository.remove(entityToRemove);
    } else {
      throw ModelNotFoundException.byId(id);
    }
  }

  public async get(id: TodoListId): Promise<TodoListReadModel> {
    this._logger.debug(`TodoListRepository#get(id: ${id})`);
    const modelOrNull = await this.find(id);
    if (modelOrNull !== null) {
      return modelOrNull;
    } else {
      throw ModelNotFoundException.byId(id);
    }
  }

  public async find(id: TodoListId): Promise<TodoListReadModel | null> {
    this._logger.debug(`TodoListRepository#find(id: ${id})`);
    const entity = await this._typeOrmRepository
      .createQueryBuilder("list")
      .select()
      .leftJoinAndSelect("list.items", "items")
      .where("list.modelId = :modelId")
      .setParameters({
        modelId: id.toString()
      })
      .getOne();
    if (entity !== undefined) {
      return this.convertToModel(entity);
    } else {
      return null;
    }
  }

  public async has(id: TodoListId): Promise<boolean> {
    this._logger.debug(`TodoListRepository#has(id: ${id})`);
    const count = await this._typeOrmRepository
      .createQueryBuilder()
      .select()
      .where("modelId = :modelId")
      .setParameters({
        modelId: id.toString()
      })
      .getCount();
    return count !== 0;
  }

  public async save(model: TodoListReadModel): Promise<void> {
    this._logger.debug(
      `TodoListRepository#save(model: ${JSON.stringify(model)})`
    );
    const entity =
      (await this._typeOrmRepository
        .createQueryBuilder("list")
        .select()
        .leftJoinAndSelect("list.items", "items")
        .where("list.modelId = :modelId")
        .setParameters({
          modelId: model.getId().toString()
        })
        .getOne()) || new TodoListEntity();

    entity.modelId = model.getId().toString();
    entity.name = model.name;
    entity.items = model.items.map(item => {
      const itemEntity = new TodoItemEntity();
      const existingItemEntity = entity.items.find(i => i.modelId === item.id);
      if (existingItemEntity) {
        itemEntity.id = existingItemEntity.id;
      }
      itemEntity.modelId = item.id;
      itemEntity.description = item.description;
      itemEntity.done = item.done;
      return itemEntity;
    });
    await this._typeOrmRepository.save(entity);
  }

  protected convertToModel(entity: TodoListEntity): TodoListReadModel {
    const model = new TodoListReadModel(new TodoListId(entity.modelId));
    model.name = entity.name;
    if (entity.items !== undefined) {
      model.items = entity.items.map(item => ({
        description: item.description,
        done: item.done,
        id: item.modelId
      }));
    } else {
      model.items = [];
    }
    return model;
  }
}
