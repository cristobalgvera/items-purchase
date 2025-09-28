import type {
  ConfirmInputDto,
  ConfirmOutputDto,
  NotifierService,
  NotifyInputDto,
} from "./notifier.service";

export class NotifierUiService implements NotifierService {
  readonly #ui = SpreadsheetApp.getUi();

  notify(input: NotifyInputDto) {
    if (!input.title) {
      this.#ui.alert(input.message, this.#ui.ButtonSet.OK);
      return;
    }

    this.#ui.alert(input.title, input.message, this.#ui.ButtonSet.OK);
  }

  confirm(input: ConfirmInputDto): ConfirmOutputDto {
    const result = input.title
      ? this.#ui.alert(input.title, input.message, this.#ui.ButtonSet.OK_CANCEL)
      : this.#ui.alert(input.message, this.#ui.ButtonSet.OK_CANCEL);

    return {
      isConfirmed: result === this.#ui.Button.OK,
    };
  }
}
