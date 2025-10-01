import type {
  ValidateItemExistsInputDto,
  ValidateItemExistsOutputDto,
  ValidateItemExistsService,
} from "../application/ports/validate-item-exists.service";
import { ITEM_NAME_RANGE } from "./shared/constant";

export class ValidateItemExistsSheetService
  implements ValidateItemExistsService
{
  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  validateItemExists(
    input: ValidateItemExistsInputDto
  ): ValidateItemExistsOutputDto {
    return {
      itemExists: this.#sheet
        .getRange(ITEM_NAME_RANGE)
        .getValues()
        .some(([itemName]) => itemName === input.itemName),
    };
  }
}
