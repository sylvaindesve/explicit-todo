import { AbstractSpecification } from "../../../utils/specification";

export class IsTodoListNameValid extends AbstractSpecification<string> {
  public explanation(): string {
    return "Todo list name must be non-empty and no longer than 100 characters";
  }

  public satisfiedBy(target: string): boolean {
    return target.length !== 0 && target.length <= 100;
  }
}
