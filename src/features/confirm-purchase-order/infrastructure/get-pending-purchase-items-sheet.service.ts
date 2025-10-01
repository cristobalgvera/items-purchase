import { DomainException } from "@core/exceptions/domain.exception";
import type {
  GetPendingPurchaseItemsOutputDto,
  GetPendingPurchaseItemsService,
  PendingPurchaseItem,
} from "../application/ports/get-pending-purchase-items.service";
import { generateItemId } from "./generate-item-id.util";

export class GetPendingPurchaseItemsSheetService
  implements GetPendingPurchaseItemsService
{
  static readonly #PROVIDER_NAME_CELL_RANGE = "B1";
  static readonly #ITEMS_CELL_RANGE = "D2:J";
  static readonly #QUANTITY_CORRECTION_COLUMN_INDEX = 0;
  static readonly #ITEM_NAME_COLUMN_INDEX = 1;
  static readonly #QUANTITY_COLUMN_INDEX = 2;
  static readonly #PURCHASE_ORDER_DATE_COLUMN_INDEX = 5;
  static readonly #DELIVERED_DATE_COLUMN_INDEX = 6;

  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  getPendingPurchaseItems(): GetPendingPurchaseItemsOutputDto {
    const providerName: string | undefined = this.#sheet
      .getRange(GetPendingPurchaseItemsSheetService.#PROVIDER_NAME_CELL_RANGE)
      .getValue();

    if (!providerName) {
      throw new DomainException({ message: "Debes especificar un proveedor" });
    }

    const pendingPurchaseItems: readonly PendingPurchaseItem[] = this.#sheet
      .getRange(GetPendingPurchaseItemsSheetService.#ITEMS_CELL_RANGE)
      .getValues()
      .filter(
        (row) =>
          !!row[GetPendingPurchaseItemsSheetService.#ITEM_NAME_COLUMN_INDEX] &&
          !row[GetPendingPurchaseItemsSheetService.#DELIVERED_DATE_COLUMN_INDEX] // INFO: Delivered date is empty (not delivered yet)
      )
      .map((row) => {
        const quantity = Number(
          row[GetPendingPurchaseItemsSheetService.#QUANTITY_COLUMN_INDEX]
        );

        const quantityCorrection =
          row[
            GetPendingPurchaseItemsSheetService
              .#QUANTITY_CORRECTION_COLUMN_INDEX
          ];

        const itemName =
          row[GetPendingPurchaseItemsSheetService.#ITEM_NAME_COLUMN_INDEX];

        return {
          itemName,
          itemId: generateItemId({
            providerName,
            itemName,
            purchaseOrderDate:
              row[
                GetPendingPurchaseItemsSheetService
                  .#PURCHASE_ORDER_DATE_COLUMN_INDEX
              ],
          }),
          quantityDifference:
            quantityCorrection === ""
              ? 0
              : Number(quantityCorrection) - quantity,
        };
      });

    if (pendingPurchaseItems.length === 0) {
      throw new DomainException({
        message: "No hay items pendientes de compra",
      });
    }

    return {
      pendingPurchaseItems,
    };
  }
}
