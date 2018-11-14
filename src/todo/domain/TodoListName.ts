import { ValueObject } from "../ValueObject";

export class TodoListName implements ValueObject<TodoListName> {

  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  public getName(): string {
    return this._name;
  }

  public toString() {
    return `TodoListName[name=${this._name}]`;
  }

  public sameAs(other: TodoListName) {
    return this._name === other._name;
  }

}
