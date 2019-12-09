import { AbstractSpecification, Specification } from ".";

export class NegationSpecification<Target> extends AbstractSpecification<
  Target
> {
  private _spec: Specification<Target>;

  constructor(spec: Specification<Target>) {
    super();
    this._spec = spec;
  }

  public satisfiedBy(target: Target): boolean {
    return !this._spec.satisfiedBy(target);
  }

  public explanation(): string {
    return "not(" + this._spec.explanation() + ")";
  }
}
