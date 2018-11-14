export interface ValueObject<T> {

  toString(): string;

  sameAs(other: T): boolean;

}
