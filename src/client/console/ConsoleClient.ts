import { Answers, Question } from 'inquirer';
import { Observable } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { CreateTodoList, Notification, RenameTodoList } from 'todo/command';
import { TodoListId } from 'todo/domain';
import { GetAllTodoLists } from 'todo/query';
import { TodoListReadModel } from 'todo/read';
import { TodoApp } from 'todo/TodoApp';
import { ReplayService } from 'ts-eventsourcing/ReplayService';
import Vorpal = require('vorpal');

export class ConsoleClient extends Vorpal {

  private _todoApp: TodoApp;

  constructor(todoApp: TodoApp) {
    super();
    this._todoApp = todoApp;
    this
      .delimiter('todo>');
    this
      .command('show', 'Show lists.')
      .action(this.showListAction);
    this
      .command('create <name>', 'Create a new todo list.')
      .action(this.createListAction);
    this
      .command('rename', 'Rename a todo list.')
      .action(this.renameListAction);
    this
      .command('events', 'Dump all events')
      .action(this.dumpEvents);
    this
      .command('repository', 'Dump repository')
      .action(this.dumpRepository);
    this
      .command('replay', 'Replay events')
      .action(this.replay);
  }

  private showListAction: Vorpal.Action = async (args: Vorpal.Args) => {
    const lists = await this._todoApp
      .getQueryBus()
      .dispatch(new GetAllTodoLists());
    (lists as TodoListReadModel[]).forEach((l) => {
      this.log(`> ${l.name}`);
    });
  }

  private createListAction: Vorpal.Action = async (args: Vorpal.Args) => {
    const name: string = args.name;
    const not: Notification = await this._todoApp
      .getCommandBus()
      .dispatch(new CreateTodoList(TodoListId.create().toString(), name));
    if (!not.hasErrors()) {
      this.log(`Created list ${name}`);
    } else {
      this.log(`Got errors: ${Array.from(not.getErrors().values()).join(', ')}`);
    }
  }

  private renameListAction: Vorpal.Action = async (args: Vorpal.Args) => {

    const lists$ = await this._todoApp
      .getQueryBus()
      .dispatch(new GetAllTodoLists()) as Observable<TodoListReadModel>;
    const lists = await lists$.pipe(toArray()).toPromise();
    const listChoices = lists.map((l) => {
      return { name: l.name, value: l.id.toString() };
    });

    if (listChoices && listChoices.length !== 0) {
      const whichListQuestion: Question<Answers> = {
        choices: listChoices,
        message: 'Choose list to rename:',
        name: 'selectedList',
        type: 'list',
      };
      const newNameQuestion: Question<Answers> = {
        message: 'New name?',
        name: 'newName',
        type: 'input',
      };
      await this.activeCommand.prompt([whichListQuestion, newNameQuestion]).then(async (answers: Answers) => {
        const idList = answers.selectedList;
        const newName = answers.newName;
        const not: Notification = await this._todoApp
          .getCommandBus()
          .dispatch(new RenameTodoList(idList, newName));
        if (!not.hasErrors()) {
          this.log(`Renamed list`);
        } else {
          this.log(`Got errors: ${Array.from(not.getErrors().values()).join(', ')}`);
        }
      });
    }

  }

  private dumpEvents: Vorpal.Action = async (args: Vorpal.Args) => {
    const stream = await this._todoApp.getEventStore().loadAll();
    stream.pipe(
      map((dm) => {
        return dm.toString() + ':' + JSON.stringify(dm.payload);
      }),
    ).subscribe((s) => { this.log(s); });
  }

  private dumpRepository: Vorpal.Action = async (args: Vorpal.Args) => {
    const lists = await this._todoApp.getTodoListRepository().findAll();
    lists.forEach((l) => {
      this.log(JSON.stringify(l));
    });
  }

  private replay: Vorpal.Action = async (args: Vorpal.Args) => {
    const replayService = new ReplayService(
      this._todoApp.getEventStore(),
      this._todoApp.getEventBus(),
    );
    replayService.replay();
  }

}
