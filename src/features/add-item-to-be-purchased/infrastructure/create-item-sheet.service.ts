import type {
  CreateItemInputDto,
  CreateItemService,
} from "../application/ports/create-item.service";
import {
  ITEM_NAME_COLUMN_INDEX,
  QUANTITY_COLUMN_INDEX,
} from "./shared/constant";

export class CreateItemSheetService implements CreateItemService {
  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  createItem(input: CreateItemInputDto): void {
    const itemRow: unknown[] = [];
    itemRow[ITEM_NAME_COLUMN_INDEX] = input.itemName;
    itemRow[QUANTITY_COLUMN_INDEX] = input.quantity;

    this.#sheet.appendRow(itemRow);
  }
}
