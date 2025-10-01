import type {
  AdjustQuantityDifferenceInputDto,
  AdjustQuantityDifferenceOutputDto,
  AdjustQuantityDifferenceService,
} from "../application/ports/adjust-quantity-difference.service";

export class AdjustQuantityDifferenceSheetService
  implements AdjustQuantityDifferenceService
{
  static readonly #ITEM_NAME_COLUMN_INDEX = 0;
  static readonly #DISPLAY_QUANTITY_COLUMN_INDEX = 3;

  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  adjustQuantityDifference(
    input: AdjustQuantityDifferenceInputDto
  ): AdjustQuantityDifferenceOutputDto {
    const items = new Map<string, number>(
      this.#sheet
        .getDataRange()
        .getValues()
        .map((row) => [
          String(
            row[AdjustQuantityDifferenceSheetService.#ITEM_NAME_COLUMN_INDEX]
          ),
          Number(
            row[
              AdjustQuantityDifferenceSheetService
                .#DISPLAY_QUANTITY_COLUMN_INDEX
            ]
          ),
        ])
    );

    return {
      adjustedItems: input.itemsToAdjust
        .map((itemToAdjust) => {
          const displayQuantity = items.get(itemToAdjust.itemName);

          if (displayQuantity === undefined) {
            throw new Error(`Item not found: ${itemToAdjust.itemName}`);
          }

          const adjustedDifference =
            (itemToAdjust.quantityDifference % displayQuantity) +
            (itemToAdjust.quantityDifference < displayQuantity / 2 ? 0 : 1);

          return {
            itemName: itemToAdjust.itemName,
            quantityDifference: adjustedDifference,
          };
        })
        .filter((item) => item.quantityDifference > 0),
    };
  }
}
