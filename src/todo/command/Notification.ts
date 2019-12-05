export class Notification {
  private _errors: Map<string, string> = new Map<string, string>();

  public addError(field: string, error: string): void {
    this._errors.set(field, error);
  }

  public hasErrors(): boolean {
    return this._errors.size !== 0;
  }

  public getErrors(): Map<string, string> {
    return this._errors;
  }
}
