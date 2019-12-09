/**
 * A Specification.
 */
export interface Specification<Target> {
  satisfiedBy(target: Target): boolean;

  and(spec: Specification<Target>): Specification<Target>;

  or(spec: Specification<Target>): Specification<Target>;

  negate(): Specification<Target>;

  explanation(): string;
}
