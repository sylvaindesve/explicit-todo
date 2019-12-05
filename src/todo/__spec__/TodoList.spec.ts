import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";
import { EventSourcingTestBench } from "ts-eventsourcing/Testing/EventSourcingTestBench";
import { UuidIdentity } from "ts-eventsourcing/ValueObject/UuidIdentity";
import { AddItemToTodoList } from "../command/AddItemToTodoList";
import { CreateTodoList } from "../command/CreateTodoList";
import { MarkItemDone } from "../command/MarkItemDone";
import { RenameTodoList } from "../command/RenameTodoList";
import { TodoListCommandHandler } from "../command/TodoListCommandHandler";
import { TodoItemAdded } from "../domain/event/TodoItemAdded";
import { TodoItemDone } from "../domain/event/TodoItemDone";
import { TodoListCreated } from "../domain/event/TodoListCreated";
import { TodoListNameChanged } from "../domain/event/TodoListNameChanged";
import { TodoItemStatus } from "../domain/TodoItemStatus";
import { TodoList } from "../domain/TodoList";
import { TodoListId } from "../domain/TodoListId";
import { GetAllTodoLists, TodoListQueryHandler } from "../query";
import { TodoListProjector } from "../read/TodoListProjector";
import { TodoListReadModel } from "../read/TodoListReadModel";

describe("TodoList scenario", () => {
  test("Creating a new TodoList", async () => {
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

  test("Creating a new TodoList with a name too long", async () => {
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

  test("Renaming a TodoList", async () => {
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

  test("Adding items to TodoList", async () => {
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

  test("Marking item done", async () => {
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

  test("Projecting TodoListReadModel", async () => {
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

  test("Getting all lists", async () => {
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
