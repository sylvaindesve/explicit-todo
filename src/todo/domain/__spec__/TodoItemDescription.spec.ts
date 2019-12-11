import { TodoItemDescription } from "../..";

describe("TodoItemDescription", () => {
  it("has a toString representation", () => {
    const description = new TodoItemDescription("Some description");
    expect(description.toString()).toBe(
      "TodoItemDescription[description=Some description]"
    );
  });

  it("is equal by value", () => {
    const desc1 = new TodoItemDescription("Some description");
    const desc2 = new TodoItemDescription("Some description");
    const desc3 = new TodoItemDescription("Some other description");

    expect(desc1.sameAs(desc2)).toBe(true);
    expect(desc1.sameAs(desc3)).toBe(false);
  });
});
