import {
  ConjunctionSpecification,
  DisjunctionSpecification,
  NegationSpecification,
  Specification
} from ".";

export abstract class AbstractSpecification<Target>
  implements Specification<Target> {
  constructor() {
    /** required to avoid runtime error */
  }

  public abstract satisfiedBy(target: Target): boolean;

  public and(spec: Specification<Target>): Specification<Target> {
    return new ConjunctionSpecification(this, spec);
  }

  public or(spec: Specification<Target>): Specification<Target> {
    return new DisjunctionSpecification(this, spec);
  }

  public negate(): Specification<Target> {
    return new NegationSpecification(this);
  }

  public abstract explanation(): string;
}
