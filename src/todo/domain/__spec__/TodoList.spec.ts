import { map, toArray } from "rxjs/operators";
import { EventSourcingTestBench } from "ts-eventsourcing/Testing/EventSourcingTestBench";
import {
  TodoItemAdded,
  TodoItemDescription,
  TodoItemDone,
  TodoItemId,
  TodoItemStatus,
  TodoList,
  TodoListArchived,
  TodoListCreated,
  TodoListId,
  TodoListName,
  TodoListNameChanged
} from "../..";

async function getEvents(list: TodoList) {
  return await list
    .getUncommittedEvents()
    .pipe(
      map(dm => dm.payload),
      toArray()
    )
    .toPromise();
}

describe("TodoList", () => {
  it("is instanciated with an empty name", () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);
    expect(list.getName().sameAs(new TodoListName(""))).toBe(true);
  });

  it("can set a new name", async () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);
    list.setName(new TodoListName("My list"));
    expect(list.getName().sameAs(new TodoListName("My list"))).toBe(true);
    const events = await getEvents(list);
    expect(events[0] instanceof TodoListNameChanged).toBe(true);
    expect((events[0] as TodoListNameChanged).name).toBe("My list");
  });

  it("is instanciated as not archived", () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);
    expect(list.isArchived()).toBe(false);
  });

  it("can be archived", async () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);
    list.archive();
    expect(list.isArchived()).toBe(true);
    const events = await getEvents(list);
    expect(events[0] instanceof TodoListArchived).toBe(true);
  });

  it("is instanciated with no items", () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);
    expect(list.getItems()).toEqual([]);
  });

  it("can add items", async () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);
    const itemId = TodoItemId.create();
    list.addItem(itemId, new TodoItemDescription("My item"));
    expect(list.getItems().length).toBe(1);
    expect(list.getItems()[0].getId()).toEqual(itemId);
    const events = await getEvents(list);
    expect(events[0] instanceof TodoItemAdded).toBe(true);
    expect((events[0] as TodoItemAdded).description).toBe("My item");
  });

  it("can mark items as done", async () => {
    const listId = TodoListId.create();
    const list = new TodoList(listId);

    const [itemId1, itemId2, itemId3] = [
      TodoItemId.create(),
      TodoItemId.create(),
      TodoItemId.create()
    ];

    list.addItem(itemId1, new TodoItemDescription("Item 1"));
    list.addItem(itemId2, new TodoItemDescription("Item 2"));
    list.addItem(itemId3, new TodoItemDescription("Item 3"));

    list.markItemDone(itemId2);
    expect(
      list
        .getItems()
        .find(i => i.getId().toString() === itemId2.toString())!
        .getStatus()
    ).toBe(TodoItemStatus.DONE);

    const events = await getEvents(list);
    expect(events[3] instanceof TodoItemDone).toBe(true);
    expect((events[3] as TodoItemDone).idItem).toBe(itemId2.toString());
  });

  describe("event application", () => {
    it("applies creation", async () => {
      const listId = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenEvents(listId, TodoList, [new TodoListCreated()])
        .thenAssert(async tb => {
          const hasList = await tb.getAggregateRepository(TodoList).has(listId);
          expect(hasList).toBe(true);
        });
    });

    it("applies renaming", async () => {
      const listId = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenEvents(listId, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New name")
        ])
        .thenAssert(async tb => {
          const list = (await tb
            .getAggregateRepository(TodoList)
            .load(listId)) as TodoList;
          expect(list.getName().sameAs(new TodoListName("New name"))).toBe(
            true
          );
        });
    });

    it("applies archiving", async () => {
      const listId = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenEvents(listId, TodoList, [
          new TodoListCreated(),
          new TodoListArchived()
        ])
        .thenAssert(async tb => {
          const list = (await tb
            .getAggregateRepository(TodoList)
            .load(listId)) as TodoList;
          expect(list.isArchived()).toBe(true);
        });
    });

    it("applies item addition", async () => {
      const listId = TodoListId.create();
      const itemId = TodoItemId.create();
      await EventSourcingTestBench.create()
        .givenEvents(listId, TodoList, [
          new TodoListCreated(),
          new TodoItemAdded(itemId.toString(), "Item")
        ])
        .thenAssert(async tb => {
          const list = (await tb
            .getAggregateRepository(TodoList)
            .load(listId)) as TodoList;
          expect(list.getItems().length).toBe(1);
          expect(list.getItems()[0].getId()).toEqual(itemId);
        });
    });
  });
});
