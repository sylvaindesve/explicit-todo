import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TodoItemEntity } from "./TodoItemEntity";

@Entity()
export class TodoListEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  public readonly id?: number;

  @Column({ type: "text" })
  public modelId: string;

  @Column({ type: "text" })
  public name: string;

  @OneToMany(
    () => TodoItemEntity,
    item => item.list,
    { cascade: true, eager: true }
  )
  public items: TodoItemEntity[];
}
