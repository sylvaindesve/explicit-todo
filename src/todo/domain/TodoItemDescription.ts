import { ValueObject } from "..";

export class TodoItemDescription implements ValueObject<TodoItemDescription> {
  private _description: string;

  constructor(description: string) {
    this._description = description;
  }

  public getDescription(): string {
    return this._description;
  }

  public toString() {
    return `TodoItemDescription[description=${this._description}]`;
  }

  public sameAs(other: TodoItemDescription) {
    return this._description === other._description;
  }
}
