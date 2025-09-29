import { notifierService } from "@core/notifier";
import type { NotifierService } from "@core/notifier/notifier.service";
import { DomainException } from "./domain.exception";

class ExceptionHandler {
  readonly #notifierService: NotifierService;

  constructor(notifier: NotifierService) {
    this.#notifierService = notifier;
  }

  handle(exception: unknown): void {
    if (exception instanceof DomainException) {
      this.#notifierService.notify({ message: exception.message });
    }

    throw exception;
  }
}

export function withExceptionHandler(fn: () => void): void {
  const exceptionHandler = new ExceptionHandler(notifierService);

  try {
    fn();
  } catch (error) {
    exceptionHandler.handle(error);
  }
}
