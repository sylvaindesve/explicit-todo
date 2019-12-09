import { AbstractSpecification, Specification } from ".";

export class ConjunctionSpecification<Target> extends AbstractSpecification<
  Target
> {
  private _specs: Array<Specification<Target>>;

  constructor(...specs: Array<Specification<Target>>) {
    super();
    this._specs = specs;
  }

  public satisfiedBy(target: Target): boolean {
    return this._specs.every(spec => spec.satisfiedBy(target));
  }

  public explanation(): string {
    return (
      "(" + this._specs.map(spec => spec.explanation()).join(" and ") + ")"
    );
  }
}
