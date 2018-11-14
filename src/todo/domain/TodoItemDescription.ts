import { ValueObject } from "../ValueObject";

export class TodoItemDescription implements ValueObject<TodoItemDescription> {

  private _description: string;

  constructor(name: string) {
    this._description = name;
  }

  public getDescription(): string {
    return this._description;
  }

  public toString() {
    return `TodoItemDescription[name=${this._description}]`;
  }

  public sameAs(other: TodoItemDescription) {
    return this._description === other._description;
  }

}
