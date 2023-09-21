export class SkipTreeException extends Error {}

export class ParseException {
  message: string;

  constructor(
    message: string,
    context?: { left: string; at: string; right: string }
  ) {
    this.message = message;

    if (context !== undefined) {
      this.message +=
        '<br><br>' +
        'Error context:<br> "... ' +
        context.left +
        "<span class='cursor'>" +
        context.at +
        '</span>' +
        context.right +
        ' ... "';
    }
  }
}
