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

  public and(...specs: Array<Specification<Target>>): Specification<Target> {
    return new ConjunctionSpecification(this, ...specs);
  }

  public or(...specs: Array<Specification<Target>>): Specification<Target> {
    return new DisjunctionSpecification(this, ...specs);
  }

  public negate(): Specification<Target> {
    return new NegationSpecification(this);
  }

  public abstract explanation(): string;
}
