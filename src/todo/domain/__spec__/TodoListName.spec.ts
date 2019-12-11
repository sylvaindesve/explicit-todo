import { TodoListName } from "../..";

describe("TodoItemDescription", () => {
  it("has a toString representation", () => {
    const listName = new TodoListName("Some name");
    expect(listName.toString()).toBe("TodoListName[name=Some name]");
  });

  it("is equal by value", () => {
    const listName1 = new TodoListName("Some name");
    const listName2 = new TodoListName("Some name");
    const listName3 = new TodoListName("Some other name");

    expect(listName1.sameAs(listName2)).toBe(true);
    expect(listName1.sameAs(listName3)).toBe(false);
  });
});
