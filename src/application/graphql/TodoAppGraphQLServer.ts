import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import * as winston from "winston";
import { TodoApp } from "../../todo";
import { resolvers } from "./resolvers";

export class TodoAppGraphQLServer {
  private _logger: winston.Logger;
  private _server: GraphQLServer;
  private _todoApp: TodoApp;

  constructor(todoApp: TodoApp, logger: winston.Logger) {
    this._logger = logger;
    this._todoApp = todoApp;
    this._server = new GraphQLServer({
      context: {
        logger: this._logger,
        todoApp: this._todoApp
      },
      resolvers,
      typeDefs: path.join(__dirname, "./schema/todo.schema.graphql")
    });
  }

  public start() {
    this._server.start(() => {
      this._logger.info("GraphQL server running on http://localhost:4000");
    });
  }
}
