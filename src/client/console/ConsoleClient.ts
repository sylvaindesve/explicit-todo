import { map } from "rxjs/operators";
import { EventStore } from "ts-eventsourcing/EventStore/EventStore";
import Vorpal = require("vorpal");
import { CreateTodoList } from "../../todo/command/CreateTodoList";
import { Notification } from "../../todo/command/Notification";
import { TodoListId } from "../../todo/domain/TodoListId";
import { TodoApp } from "../../todo/TodoApp";

export class ConsoleClient extends Vorpal {

  private _todoApp: TodoApp;

  constructor(todoApp: TodoApp) {
    super();
    this._todoApp = todoApp;
    this
      .delimiter("todo>");
    this
      .command("create <name>", "Create a new todo list.")
      .action(this.createListAction);
    this
      .command("events", "Dump all events")
      .action(this.dumpEvents);
  }

  private createListAction: Vorpal.Action = async (args: Vorpal.Args) => {
    const name: string = args.name;
    const not: Notification = await this._todoApp
      .getCommandBus()
      .dispatch(new CreateTodoList(TodoListId.create().toString(), name));
    if (!not.hasErrors()) {
      this.log(`Created list ${name}`);
    } else {
      this.log(`Got errors: ${Array.from(not.getErrors().values()).join(", ")}`);
    }
  }

  private dumpEvents: Vorpal.Action = async (args: Vorpal.Args) => {
    const stream = await this._todoApp.getEventStore().loadAll();
    stream.pipe(
      map((dm) => {
        return dm.toString() + ":" + JSON.stringify(dm.payload);
      }),
    ).subscribe((s) => { this.log(s); });
  }
}
