import { DomainException } from "@core/exceptions/domain.exception";
import type {
  CreatePurchaseOrderInputDto,
  CreatePurchaseOrderService,
} from "../application/ports/create-purchase-order.service";

export class CreatePurchaseOrderSheetService
  implements CreatePurchaseOrderService
{
  static readonly #PURCHASE_ORDERS_BY_PROVIDER_DATA_RANGE = "A3:E";

  static readonly #PROVIDER_NAME_CELL_POSITION = 0;
  static readonly #ITEM_NAME_CELL_POSITION = 1;
  static readonly #PURCHASE_ORDER_DATE_CELL_POSITION = 5;
  static readonly #PURCHAR_ORDER_CORRECTION_CELL_POSITION = 6;

  readonly #purchaseOrdersByProviderSheet: GoogleAppsScript.Spreadsheet.Sheet;
  readonly #historicalOrdersSheet: GoogleAppsScript.Spreadsheet.Sheet;
  readonly #ordersToBeDoneSheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(
    purchaseOrdersByProviderSheet: GoogleAppsScript.Spreadsheet.Sheet,
    historicalOrdersSheet: GoogleAppsScript.Spreadsheet.Sheet,
    ordersToBeDoneSheet: GoogleAppsScript.Spreadsheet.Sheet
  ) {
    this.#purchaseOrdersByProviderSheet = purchaseOrdersByProviderSheet;
    this.#historicalOrdersSheet = historicalOrdersSheet;
    this.#ordersToBeDoneSheet = ordersToBeDoneSheet;
  }

  createPurchaseOrder(input: CreatePurchaseOrderInputDto): void {
    const purchaseOrdersByProviderRange =
      this.#purchaseOrdersByProviderSheet.getRange(
        CreatePurchaseOrderSheetService.#PURCHASE_ORDERS_BY_PROVIDER_DATA_RANGE
      );

    this.#addPurchaseOrdersToHistoricalTable(
      purchaseOrdersByProviderRange,
      input.providerName,
      input.omittedItems
    );

    this.#clearPurchasedItemsFromPurchaseOrdersTable(
      purchaseOrdersByProviderRange,
      input.providerName,
      input.omittedItems
    );

    this.#clearPurchaseOrdersToBeDoneSheet();
  }

  #clearPurchaseOrdersToBeDoneSheet() {
    const cellsToBeCleared = [
      { desc: "Omitted items", range: "D2:D" },
      { desc: "Selected provider", range: "B1" },
    ];

    for (const { range } of cellsToBeCleared) {
      this.#ordersToBeDoneSheet.getRange(range).clearContent();
    }
  }

  #clearPurchasedItemsFromPurchaseOrdersTable(
    purchaseOrdersByProviderRange: GoogleAppsScript.Spreadsheet.Range,
    providerName: string,
    omittedItems: ReadonlySet<string>
  ) {
    const ordersByProvidersWithoutUpdatedOrders = purchaseOrdersByProviderRange
      .getValues()
      .filter(
        (row) =>
          row[CreatePurchaseOrderSheetService.#PROVIDER_NAME_CELL_POSITION] !==
            providerName ||
          omittedItems.has(
            row[CreatePurchaseOrderSheetService.#ITEM_NAME_CELL_POSITION]
          )
      );

    purchaseOrdersByProviderRange.clearContent();

    const rowNumberWhereDataStarts = 3;
    const columnNumberWhereDataStarts = 1;

    this.#purchaseOrdersByProviderSheet
      .getRange(
        rowNumberWhereDataStarts,
        columnNumberWhereDataStarts,
        ordersByProvidersWithoutUpdatedOrders.length,
        ordersByProvidersWithoutUpdatedOrders[0].length
      )
      .setValues(ordersByProvidersWithoutUpdatedOrders);

    removeExtraRows(this.#purchaseOrdersByProviderSheet);
    clearArrayFormulaRelatedColumns(this.#purchaseOrdersByProviderSheet);

    function clearArrayFormulaRelatedColumns(
      sheet: GoogleAppsScript.Spreadsheet.Sheet
    ) {
      const columnsHandledByArrayFormula = [
        { desc: "Provider", range: "A3:A" },
        { desc: "Quantity per display", range: "D3:D" },
        { desc: "Unitary aproximated cost", range: "E3:E" },
      ];

      for (const { range } of columnsHandledByArrayFormula) {
        sheet.getRange(range).clearContent();
      }
    }

    function removeExtraRows(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
      const maxRows = sheet.getMaxRows(); // Get the total number of rows in the sheet
      const lastRow = sheet.getLastRow(); // Get the last row containing data

      // If there are rows beyond the last row with data, delete them
      if (maxRows > lastRow) {
        sheet.deleteRows(lastRow + 1, maxRows - lastRow);
      }
    }
  }

  #addPurchaseOrdersToHistoricalTable(
    purchaseOrdersByProviderRange: GoogleAppsScript.Spreadsheet.Range,
    providerName: string,
    omittedItems: ReadonlySet<string>
  ) {
    const now = new Date();

    const updatedPurchaseOrders = purchaseOrdersByProviderRange
      .getValues()
      .filter(
        (row) =>
          row[CreatePurchaseOrderSheetService.#PROVIDER_NAME_CELL_POSITION] ===
            providerName &&
          !omittedItems.has(
            String(
              row[CreatePurchaseOrderSheetService.#ITEM_NAME_CELL_POSITION]
            )
          )
      )
      .map((row) => {
        row[
          CreatePurchaseOrderSheetService.#PURCHASE_ORDER_DATE_CELL_POSITION
        ] = now;

        row[
          CreatePurchaseOrderSheetService.#PURCHAR_ORDER_CORRECTION_CELL_POSITION
        ] = 0;

        return row;
      });

    if (updatedPurchaseOrders.length === 0) {
      throw new DomainException({
        message: "No hay productos por pedir para el proveedor seleccionado",
      });
    }

    this.#historicalOrdersSheet
      .getRange(
        this.#historicalOrdersSheet.getLastRow() + 1,
        1,
        updatedPurchaseOrders.length,
        updatedPurchaseOrders[0].length
      )
      .setValues(updatedPurchaseOrders);
  }
}
