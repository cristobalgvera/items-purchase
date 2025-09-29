import type {
  GetOmittedItemsOutputDto,
  GetOmittedItemsService,
} from "../application/ports/get-omitted-items.service";

export class GetOmittedItemsSheetService implements GetOmittedItemsService {
  static readonly #OMITTED_ITEMS_CELL_RANGE = "D2:E";

  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  getOmittedItems(): GetOmittedItemsOutputDto {
    return {
      items: new Set(
        this.#sheet
          .getRange(GetOmittedItemsSheetService.#OMITTED_ITEMS_CELL_RANGE)
          .getValues()
          .filter(([isOmmitted]) => !!isOmmitted)
          .map(([, itemName]) => String(itemName))
      ),
    };
  }
}
