import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TodoListEntity } from "./TodoListEntity";

@Entity()
export class TodoItemEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  public id?: number;

  @Column({ type: "text" })
  public modelId: string;

  @Column({ type: "text" })
  public description: string;

  @Column({ type: "boolean" })
  public done: boolean;

  @ManyToOne(
    () => TodoListEntity,
    list => list.items
  )
  public list: TodoListEntity;
}
