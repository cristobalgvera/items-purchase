import { DomainException } from "@core/exceptions/domain.exception";
import type {
  UpdateItemInputDto,
  UpdateItemService,
} from "../application/ports/update-item.service";
import {
  ITEM_NAME_COLUMN_INDEX,
  QUANTITY_COLUMN_INDEX,
} from "./shared/constant";

export class UpdateItemSheetService implements UpdateItemService {
  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  updateItem(input: UpdateItemInputDto): void {
    const items = this.#sheet.getDataRange().getValues();

    for (const [rowMinusOne, item] of items.entries()) {
      if (String(item[ITEM_NAME_COLUMN_INDEX]) !== input.itemName) {
        continue;
      }

      const newAmount = Number(item[QUANTITY_COLUMN_INDEX]) + input.quantity;

      this.#sheet
        .getRange(rowMinusOne + 1, QUANTITY_COLUMN_INDEX + 1)
        .setValue(newAmount);

      return;
    }

    throw new DomainException({
      message: `Producto no encontrado al actualizar la cantidad: ${input.itemName}`,
    });
  }
}
