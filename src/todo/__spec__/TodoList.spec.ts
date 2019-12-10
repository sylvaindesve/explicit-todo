import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";
import { EventSourcingTestBench } from "ts-eventsourcing/Testing/EventSourcingTestBench";
import { UuidIdentity } from "ts-eventsourcing/ValueObject/UuidIdentity";
import {
  AddItemToTodoList,
  ArchiveTodoList,
  CreateTodoList,
  GetAllTodoLists,
  MarkItemDone,
  RenameTodoList,
  TodoItemAdded,
  TodoItemDone,
  TodoItemId,
  TodoItemStatus,
  TodoList,
  TodoListArchived,
  TodoListCommandHandler,
  TodoListCreated,
  TodoListId,
  TodoListNameChanged,
  TodoListProjector,
  TodoListQueryHandler,
  TodoListReadModel
} from "..";

describe("TodoList", () => {
  describe("Creation", () => {
    it("can be created", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .whenCommands([new CreateTodoList(id.toString(), "New todo list")])
        .thenMatchEvents([
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ]);
    });

    it("cannot be created with an empty name", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .whenCommands([new CreateTodoList(id.toString(), "")])
        .thenMatchEvents([]);
    });

    it("cannot be created with a name too long", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .whenCommands([new CreateTodoList(id.toString(), "a".repeat(150))])
        .thenMatchEvents([]);
    });
  });

  describe("Renaming", () => {
    it("can be renamed", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([new RenameTodoList(id.toString(), "New name")])
        .thenMatchEvents([new TodoListNameChanged("New name")]);
    });

    it("cannot be renamed with an empty name", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([new RenameTodoList(id.toString(), "")])
        .thenMatchEvents([]);
    });

    it("cannot be renamed with a name too long", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([new RenameTodoList(id.toString(), "a".repeat(150))])
        .thenMatchEvents([]);
    });
  });

  describe("Archiving", () => {
    it("can be archived if empty", async () => {
      const id = TodoListId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([new ArchiveTodoList(id.toString())])
        .thenMatchEvents([new TodoListArchived()]);
    });

    it("cannot be archived if non-empty", async () => {
      const id = TodoListId.create();
      const idItem = UuidIdentity.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list"),
          new TodoItemAdded(idItem.toString(), "Item")
        ])
        .whenCommands([new ArchiveTodoList(id.toString())])
        .thenMatchEvents([]);
    });

    it("can be archived if containing only done items", async () => {
      const id = TodoListId.create();
      const idItem1 = TodoItemId.create();
      const idItem2 = TodoItemId.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list"),
          new TodoItemAdded(idItem1.toString(), "Item 1"),
          new TodoItemAdded(idItem2.toString(), "Item 2"),
          new TodoItemDone(idItem1.toString()),
          new TodoItemDone(idItem2.toString())
        ])
        .whenCommands([new ArchiveTodoList(id.toString())])
        .thenMatchEvents([new TodoListArchived()]);
    });
  });

  describe("Adding items", () => {
    it("new items can be added to it", async () => {
      const id = TodoListId.create();
      const idItem1 = UuidIdentity.create();
      const idItem2 = UuidIdentity.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([
          new AddItemToTodoList(id.toString(), idItem1.toString(), "Item 1"),
          new AddItemToTodoList(id.toString(), idItem2.toString(), "Item 2")
        ])
        .thenMatchEvents([
          new TodoItemAdded(idItem1.toString(), "Item 1"),
          new TodoItemAdded(idItem2.toString(), "Item 2")
        ]);
    });

    it("a new item cannot be added to it if it has an empty description", async () => {
      const id = TodoListId.create();
      const idItem = UuidIdentity.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([
          new AddItemToTodoList(id.toString(), idItem.toString(), "")
        ])
        .thenMatchEvents([]);
    });

    it("a new item cannot be added to it if it has a too long description", async () => {
      const id = TodoListId.create();
      const idItem = UuidIdentity.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list")
        ])
        .whenCommands([
          new AddItemToTodoList(
            id.toString(),
            idItem.toString(),
            "a".repeat(150)
          )
        ])
        .thenMatchEvents([]);
    });
  });

  describe("Marking items as done", () => {
    it("can have an item marked as done", async () => {
      const id = TodoListId.create();
      const idItem1 = UuidIdentity.create();
      const idItem2 = UuidIdentity.create();
      await EventSourcingTestBench.create()
        .givenCommandHandler((testBench: EventSourcingTestBench) => {
          return new TodoListCommandHandler(
            testBench.getAggregateRepository(TodoList)
          );
        })
        .givenEvents(id, TodoList, [
          new TodoListCreated(),
          new TodoListNameChanged("New todo list"),
          new TodoItemAdded(idItem1.toString(), "Item 1"),
          new TodoItemAdded(idItem2.toString(), "Item 2")
        ])
        .whenCommands([new MarkItemDone(id.toString(), idItem1.toString())])
        .thenMatchEvents([new TodoItemDone(idItem1.toString())])
        .thenAssert(async testBench => {
          const repo = testBench.getAggregateRepository(TodoList);
          const list: TodoList = await repo.load(id);
          expect(list.getItems().length).toEqual(2);
          expect(list.getItems()[0].getStatus()).toEqual(TodoItemStatus.DONE);
          expect(list.getItems()[1].getStatus()).toEqual(TodoItemStatus.TODO);
        });
    });
  });

  describe("Projecting TodoListReadModel", () => {
    it("projects creation", async () => {
      const id = TodoListId.create();
      const expectedModel = new TodoListReadModel(id);
      expectedModel.name = "List name";

      await EventSourcingTestBench.create()
        .givenEventListener(testBench => {
          return new TodoListProjector(
            testBench.getReadModelRepository(TodoListReadModel)
          );
        })
        .whenEventsHappened(id, [
          new TodoListCreated(),
          new TodoListNameChanged("List name")
        ])
        .thenModelsShouldMatch([expectedModel]);
    });

    it("projects archiving", async () => {
      const id = TodoListId.create();

      await EventSourcingTestBench.create()
        .givenEventListener(testBench => {
          return new TodoListProjector(
            testBench.getReadModelRepository(TodoListReadModel)
          );
        })
        .whenEventsHappened(id, [new TodoListCreated(), new TodoListArchived()])
        .thenModelsShouldMatch([]);
    });

    it("projects item additions", async () => {
      const id = TodoListId.create();
      const idItem = TodoItemId.create();
      const expectedModel = new TodoListReadModel(id);
      expectedModel.items.push({
        description: "Item",
        done: false,
        id: idItem.toString()
      });

      await EventSourcingTestBench.create()
        .givenEventListener(testBench => {
          return new TodoListProjector(
            testBench.getReadModelRepository(TodoListReadModel)
          );
        })
        .whenEventsHappened(id, [
          new TodoListCreated(),
          new TodoItemAdded(idItem.toString(), "Item")
        ])
        .thenModelsShouldMatch([expectedModel]);
    });

    it("projects items marked as done", async () => {
      const id = TodoListId.create();
      const idItem = TodoItemId.create();
      const expectedModel = new TodoListReadModel(id);
      expectedModel.items.push({
        description: "Item",
        done: true,
        id: idItem.toString()
      });

      await EventSourcingTestBench.create()
        .givenEventListener(testBench => {
          return new TodoListProjector(
            testBench.getReadModelRepository(TodoListReadModel)
          );
        })
        .whenEventsHappened(id, [
          new TodoListCreated(),
          new TodoItemAdded(idItem.toString(), "Item"),
          new TodoItemDone(idItem.toString())
        ])
        .thenModelsShouldMatch([expectedModel]);
    });
  });

  describe("Querying", () => {
    it("can get all lists", async () => {
      const id = TodoListId.create();
      const expectedModel = new TodoListReadModel(id);
      expectedModel.name = "List name";

      await EventSourcingTestBench.create()
        .givenEventListener(testBench => {
          return new TodoListProjector(
            testBench.getReadModelRepository(TodoListReadModel)
          );
        })
        .givenQueryHandler(testBench => {
          return new TodoListQueryHandler(
            testBench.getReadModelRepository(TodoListReadModel)
          );
        })
        .whenEventsHappened(id, [
          new TodoListCreated(),
          new TodoListNameChanged("List name")
        ])
        .thenAssert(async (testBench: EventSourcingTestBench) => {
          const result$: Observable<TodoListReadModel> = await testBench.queryBus.dispatch(
            new GetAllTodoLists()
          );
          const models = await result$.pipe(toArray()).toPromise();
          expect(models[0]).toEqual(expectedModel);
        });
    });
  });
});
