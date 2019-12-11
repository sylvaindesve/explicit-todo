// tslint:disable:max-classes-per-file
import { AbstractSpecification } from "..";

class TrueSpecification extends AbstractSpecification<any> {
  public explanation(): string {
    return "TRUE";
  }

  public satisfiedBy(_target: any): boolean {
    return true;
  }
}

class FalseSpecification extends AbstractSpecification<any> {
  public explanation(): string {
    return "FALSE";
  }

  public satisfiedBy(_target: any): boolean {
    return false;
  }
}

const trueSpec = new TrueSpecification();
const falseSpec = new FalseSpecification();

describe("Specification", () => {
  it("checks if target statisfy it", () => {
    expect(trueSpec.satisfiedBy("test")).toBe(true);
    expect(falseSpec.satisfiedBy("test")).toBe(false);
  });

  it("has an explanation", () => {
    expect(trueSpec.explanation()).toBe("TRUE");
    expect(falseSpec.explanation()).toBe("FALSE");
  });

  it("can be combined with AND", () => {
    const trueAndFalseSpec = trueSpec.and(falseSpec);
    expect(trueAndFalseSpec.satisfiedBy("test")).toBe(false);
  });

  it("can be combined with AND", () => {
    const trueAndFalseSpec = trueSpec.and(falseSpec);
    expect(trueAndFalseSpec.satisfiedBy("test")).toBe(false);

    const trueAndFalseAndFalseSpec = trueSpec.and(falseSpec, falseSpec);
    expect(trueAndFalseAndFalseSpec.satisfiedBy("test")).toBe(false);
  });

  it("constructs combined explanation when combined with AND", () => {
    const trueAndFalseSpec = trueSpec.and(falseSpec);
    expect(trueAndFalseSpec.explanation()).toBe("(TRUE and FALSE)");

    const trueAndFalseAndFalseSpec = trueSpec.and(falseSpec, falseSpec);
    expect(trueAndFalseAndFalseSpec.explanation()).toBe(
      "(TRUE and FALSE and FALSE)"
    );
  });

  it("can be combined with OR", () => {
    const trueOrFalseSpec = trueSpec.or(falseSpec);
    expect(trueOrFalseSpec.satisfiedBy("test")).toBe(true);

    const trueOrFalseOrFalseSpec = trueSpec.or(falseSpec, falseSpec);
    expect(trueOrFalseOrFalseSpec.satisfiedBy("test")).toBe(true);
  });

  it("constructs combined explanation when combined with OR", () => {
    const trueOrFalseSpec = trueSpec.or(falseSpec);
    expect(trueOrFalseSpec.explanation()).toBe("(TRUE or FALSE)");

    const trueOrFalseOrFalseSpec = trueSpec.or(falseSpec, falseSpec);
    expect(trueOrFalseOrFalseSpec.explanation()).toBe(
      "(TRUE or FALSE or FALSE)"
    );
  });

  it("can be negated", () => {
    const notTrue = trueSpec.negate();
    expect(notTrue.satisfiedBy("test")).toBe(false);

    const notFalse = falseSpec.negate();
    expect(notFalse.satisfiedBy("test")).toBe(true);
  });

  it("constructs explanation when negated", () => {
    const notTrue = trueSpec.negate();
    expect(notTrue.explanation()).toBe("not(TRUE)");
  });
});
