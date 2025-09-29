import { DomainException } from "@core/exceptions/domain.exception";
import type {
  CreatePurchaseOrderInputDto,
  CreatePurchaseOrderService,
} from "../application/ports/create-purchase-order.service";

export class CreatePurchaseOrderSheetService
  implements CreatePurchaseOrderService
{
  static readonly #ORDER_TO_BE_DONE_SHEET_NAME = "Pedido por realizar";
  static readonly #PURCHASE_ORDERS_BY_PROVIDER_SHEET_NAME =
    "Pedidos por proveedor";
  static readonly #PURCHASE_ORDERS_BY_PROVIDER_DATA_RANGE = "A3:E";
  static readonly #HISTORICAL_PURCHASE_ORDERS_SHEET_NAME = "Pedidos históricos";

  static readonly #PROVIDER_NAME_CELL_POSITION = 0;
  static readonly #ITEM_NAME_CELL_POSITION = 1;
  static readonly #PURCHASE_ORDER_DATE_CELL_POSITION = 5;
  static readonly #PURCHAR_ORDER_CORRECTION_CELL_POSITION = 6;

  readonly #spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    this.#spreadsheet = spreadsheet;
  }

  createPurchaseOrder(input: CreatePurchaseOrderInputDto): void {
    const purchaseOrdersByProviderSheet = this.#spreadsheet.getSheetByName(
      CreatePurchaseOrderSheetService.#PURCHASE_ORDERS_BY_PROVIDER_SHEET_NAME
    );

    if (!purchaseOrdersByProviderSheet) {
      throw new DomainException({
        message: `No se ha encontrado la hoja '${CreatePurchaseOrderSheetService.#PURCHASE_ORDERS_BY_PROVIDER_SHEET_NAME}'`,
      });
    }

    const purchaseOrdersByProviderRange =
      purchaseOrdersByProviderSheet.getRange(
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
    const ordersToBeDoneSheet = this.#spreadsheet.getSheetByName(
      CreatePurchaseOrderSheetService.#ORDER_TO_BE_DONE_SHEET_NAME
    );

    if (!ordersToBeDoneSheet) {
      throw new DomainException({
        message: `No se ha encontrado la hoja '${CreatePurchaseOrderSheetService.#ORDER_TO_BE_DONE_SHEET_NAME}'`,
      });
    }

    const cellsToBeCleared = [
      { desc: "Omitted items", range: "D2:D" },
      { desc: "Selected provider", range: "B1" },
    ];

    for (const { range } of cellsToBeCleared) {
      ordersToBeDoneSheet.getRange(range).clearContent();
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

    const purchaseOrdersByProviderSheet =
      purchaseOrdersByProviderRange.getSheet();

    purchaseOrdersByProviderSheet
      .getRange(
        rowNumberWhereDataStarts,
        columnNumberWhereDataStarts,
        ordersByProvidersWithoutUpdatedOrders.length,
        ordersByProvidersWithoutUpdatedOrders[0].length
      )
      .setValues(ordersByProvidersWithoutUpdatedOrders);

    removeExtraRows(purchaseOrdersByProviderSheet);
    clearArrayFormulaRelatedColumns(purchaseOrdersByProviderSheet);

    function clearArrayFormulaRelatedColumns(
      ordersByProviderSheet: GoogleAppsScript.Spreadsheet.Sheet
    ) {
      const columnsHandledByArrayFormula = [
        { desc: "Provider", range: "A3:A" },
        { desc: "Quantity per display", range: "D3:D" },
        { desc: "Unitary aproximated cost", range: "E3:E" },
      ];

      for (const { range } of columnsHandledByArrayFormula) {
        ordersByProviderSheet.getRange(range).clearContent();
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

    const historicalOrdersSheet = this.#spreadsheet.getSheetByName(
      CreatePurchaseOrderSheetService.#HISTORICAL_PURCHASE_ORDERS_SHEET_NAME
    );

    if (!historicalOrdersSheet) {
      throw new DomainException({
        message: `No se ha encontrado la hoja '${CreatePurchaseOrderSheetService.#HISTORICAL_PURCHASE_ORDERS_SHEET_NAME}'`,
      });
    }

    historicalOrdersSheet
      .getRange(
        historicalOrdersSheet.getLastRow() + 1,
        1,
        updatedPurchaseOrders.length,
        updatedPurchaseOrders[0].length
      )
      .setValues(updatedPurchaseOrders);
  }
}
