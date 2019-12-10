import { Answers, Question } from "inquirer";
import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";
import { map } from "rxjs/operators";
import { ReplayService } from "ts-eventsourcing/ReplayService";
import Vorpal = require("vorpal");
import {
  AbandonItem,
  AddItemToTodoList,
  ArchiveTodoList,
  CreateTodoList,
  GetAllTodoLists,
  MarkItemDone,
  Notification,
  RenameTodoList,
  TodoApp,
  TodoItemId,
  TodoListId,
  TodoListReadModel
} from "../../todo";

export class ConsoleClient extends Vorpal {
  private _todoApp: TodoApp;
  private _contextualCommands: { [commandName: string]: Vorpal.Command } = {};
  private _currentListId?: string;

  constructor(todoApp: TodoApp) {
    super();
    this._todoApp = todoApp;

    this.setupRootLevel();

    this.command("events", "Dump all events").action(this.dumpEventsAction);
    this.command("repository", "Dump repository").action(
      this.dumpRepositoryAction
    );
    this.command("replay", "Replay events").action(this.replayAction);
  }

  private clearContextualCommands() {
    for (const commandName in this._contextualCommands) {
      if (this._contextualCommands.hasOwnProperty(commandName)) {
        this._contextualCommands[commandName].remove();
        delete this._contextualCommands[commandName];
      }
    }
  }

  private setupRootLevel() {
    this.clearContextualCommands();
    this.delimiter("todo>");
    this._contextualCommands.showLists = this.command(
      "show",
      "Show lists."
    ).action(this.showListAction);
    this._contextualCommands.gotoList = this.command(
      "goto <name>",
      "Go to todo list"
    ).action(this.gotoListAction);
    this._contextualCommands.archiveList = this.command(
      "archive <name>",
      "Archive the todo list"
    ).action(this.archiveListAction);
    this._contextualCommands.createList = this.command(
      "create <name>",
      "Create a new todo list."
    ).action(this.createListAction);
    this._contextualCommands.renameList = this.command(
      "rename",
      "Rename a todo list."
    ).action(this.renameListAction);
  }

  private showListAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    const lists = await this._todoApp
      .getQueryBus()
      .dispatch(new GetAllTodoLists());
    (lists as TodoListReadModel[]).forEach(l => {
      this.log(`> ${l.name} (${l.items.length})`);
    });
  };

  private gotoListAction: Vorpal.Action = async (args: Vorpal.Args) => {
    const lists$ = (await this._todoApp
      .getQueryBus()
      .dispatch(new GetAllTodoLists())) as Observable<TodoListReadModel>;
    const lists = await lists$.pipe(toArray()).toPromise();
    const targetList = lists.find(l => l.name === args.name);

    if (targetList) {
      this._currentListId = targetList.getId().toString();
      this.clearContextualCommands();
      this.delimiter(`todo | ${targetList.name}>`);
      this._contextualCommands.renameCurrentList = this.command(
        "rename <newName>",
        "Rename current list"
      ).action(this.renameCurrentListAction);
      this._contextualCommands.goBack = this.command(
        "back",
        "Go back to lists"
      ).action(this.goBackToListsAction);
      this._contextualCommands.addItem = this.command(
        "add <description>",
        "Add an item to the list"
      ).action(this.addTodoItemAction);
      this._contextualCommands.showItems = this.command(
        "show",
        "Show items in the list"
      ).action(this.showTodoItemsAction);
      this._contextualCommands.markItemDone = this.command(
        "check <item>",
        "Mark the item as done"
      ).action(this.markTodoItemDoneAction);
      this._contextualCommands.markItemDone = this.command(
        "abandon <item>",
        "Abandon the item"
      ).action(this.abandonTodoItemDoneAction);
    } else {
      this.log(`Error: unknown list ${args.name}`);
    }
  };

  private archiveListAction: Vorpal.Action = async (args: Vorpal.Args) => {
    const lists$ = (await this._todoApp
      .getQueryBus()
      .dispatch(new GetAllTodoLists())) as Observable<TodoListReadModel>;
    const lists = await lists$.pipe(toArray()).toPromise();
    const targetList = lists.find(l => l.name === args.name);

    if (targetList) {
      const not: Notification = await this._todoApp
        .getCommandBus()
        .dispatch(new ArchiveTodoList(targetList.getId().toString()));
      if (!not.hasErrors()) {
        this.log(`Archived list ${args.name}`);
      } else {
        this.log(
          `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
        );
      }
    }
  };

  private goBackToListsAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    this._currentListId = undefined;
    this.setupRootLevel();
  };

  private createListAction: Vorpal.Action = async (args: Vorpal.Args) => {
    const name: string = args.name;
    const not: Notification = await this._todoApp
      .getCommandBus()
      .dispatch(new CreateTodoList(TodoListId.create().toString(), name));
    if (!not.hasErrors()) {
      this.log(`Created list ${name}`);
    } else {
      this.log(
        `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
      );
    }
  };

  private renameListAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    const lists$ = (await this._todoApp
      .getQueryBus()
      .dispatch(new GetAllTodoLists())) as Observable<TodoListReadModel>;
    const lists = await lists$.pipe(toArray()).toPromise();
    const listChoices = lists.map(l => {
      return { name: l.name, value: l.id.toString() };
    });

    if (listChoices && listChoices.length !== 0) {
      const whichListQuestion: Question<Answers> = {
        choices: listChoices,
        message: "Choose list to rename:",
        name: "selectedList",
        type: "list"
      };
      const newNameQuestion: Question<Answers> = {
        message: "New name?",
        name: "newName",
        type: "input"
      };
      await this.activeCommand
        .prompt([whichListQuestion, newNameQuestion])
        .then(async (answers: Answers) => {
          const idList = answers.selectedList;
          const newName = answers.newName;
          const not: Notification = await this._todoApp
            .getCommandBus()
            .dispatch(new RenameTodoList(idList, newName));
          if (!not.hasErrors()) {
            this.log(`Renamed list`);
          } else {
            this.log(
              `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
            );
          }
        });
    }
  };

  private renameCurrentListAction: Vorpal.Action = async (
    args: Vorpal.Args
  ) => {
    if (this._currentListId) {
      const not: Notification = await this._todoApp
        .getCommandBus()
        .dispatch(new RenameTodoList(this._currentListId, args.newName));
      if (!not.hasErrors()) {
        this.delimiter(`todo | ${args.newName}>`);
        this.log(`Renamed list`);
      } else {
        this.log(
          `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
        );
      }
    }
  };

  private showTodoItemsAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    if (this._currentListId) {
      const lists$ = (await this._todoApp
        .getQueryBus()
        .dispatch(new GetAllTodoLists())) as Observable<TodoListReadModel>;
      const lists = await lists$.pipe(toArray()).toPromise();
      const currentList = lists.find(
        l => l.id.toString() === this._currentListId
      );
      if (currentList) {
        currentList.items.forEach(item => {
          this.log(`> ${item.description}${item.done ? " 👍" : ""}`);
        });
      }
    }
  };

  private addTodoItemAction: Vorpal.Action = async (args: Vorpal.Args) => {
    if (this._currentListId) {
      const not: Notification = await this._todoApp
        .getCommandBus()
        .dispatch(
          new AddItemToTodoList(
            this._currentListId,
            TodoItemId.create().toString(),
            args.description
          )
        );
      if (!not.hasErrors()) {
        this.log(`Item added`);
      } else {
        this.log(
          `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
        );
      }
    }
  };

  private markTodoItemDoneAction: Vorpal.Action = async (args: Vorpal.Args) => {
    if (this._currentListId) {
      const lists$ = (await this._todoApp
        .getQueryBus()
        .dispatch(new GetAllTodoLists())) as Observable<TodoListReadModel>;
      const lists = await lists$.pipe(toArray()).toPromise();
      const currentList = lists.find(
        l => l.id.toString() === this._currentListId
      );
      if (currentList) {
        const itemToMarkAsDone = currentList.items.find(
          item => item.description === args.item
        );
        if (itemToMarkAsDone) {
          const not: Notification = await this._todoApp
            .getCommandBus()
            .dispatch(
              new MarkItemDone(this._currentListId, itemToMarkAsDone.id)
            );
          if (!not.hasErrors()) {
            this.log(`Item marked as done`);
          } else {
            this.log(
              `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
            );
          }
        } else {
          this.log(`Error: no such item "${args.item}"`);
        }
      }
    }
  };

  private abandonTodoItemDoneAction: Vorpal.Action = async (
    args: Vorpal.Args
  ) => {
    if (this._currentListId) {
      const lists$ = (await this._todoApp
        .getQueryBus()
        .dispatch(new GetAllTodoLists())) as Observable<TodoListReadModel>;
      const lists = await lists$.pipe(toArray()).toPromise();
      const currentList = lists.find(
        l => l.id.toString() === this._currentListId
      );
      if (currentList) {
        const itemToAbandon = currentList.items.find(
          item => item.description === args.item
        );
        if (itemToAbandon) {
          const not: Notification = await this._todoApp
            .getCommandBus()
            .dispatch(new AbandonItem(this._currentListId, itemToAbandon.id));
          if (!not.hasErrors()) {
            this.log(`Item abandonned`);
          } else {
            this.log(
              `Got errors: ${Array.from(not.getErrors().values()).join(", ")}`
            );
          }
        } else {
          this.log(`Error: no such item "${args.item}"`);
        }
      }
    }
  };

  private dumpEventsAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    const stream = await this._todoApp.getEventStore().loadAll();
    stream
      .pipe(
        map(dm => {
          return dm.toString() + ":" + JSON.stringify(dm.payload);
        })
      )
      .subscribe(s => {
        this.log(s);
      });
  };

  private dumpRepositoryAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    const lists = await this._todoApp.getTodoListRepository().findAll();
    lists.forEach(l => {
      this.log(JSON.stringify(l));
    });
  };

  private replayAction: Vorpal.Action = async (_args: Vorpal.Args) => {
    const replayService = new ReplayService(
      this._todoApp.getEventStore(),
      this._todoApp.getEventBus()
    );
    replayService.replay();
  };
}
