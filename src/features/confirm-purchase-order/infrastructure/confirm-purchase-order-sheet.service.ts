import type {
  ConfirmPurchaseOrderInputDto,
  ConfirmPurchaseOrderService,
} from "../application/ports/confirm-purchase-order.service";
import { generateItemId } from "./generate-item-id.util";

export class ConfirmPurchaseOrderSheetService
  implements ConfirmPurchaseOrderService
{
  static readonly #DATA_RANGE = "A2:I";
  static readonly #PROVIDER_NAME_COLUMN_INDEX = 0;
  static readonly #ITEM_NAME_COLUMN_INDEX = 1;
  static readonly #PURCHASE_ORDER_DATE_COLUMN_INDEX = 5;
  static readonly #QUANTITY_CORRECTION_COLUMN_INDEX = 6;
  static readonly #DELIVERED_DATE_COLUMN_INDEX = 7;

  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  confirmPurchaseOrder(input: ConfirmPurchaseOrderInputDto): void {
    const pendingPurchaseOrdersMap: Map<
      ConfirmPurchaseOrderInputDto["pendingPurchaseItems"][number]["itemId"],
      ConfirmPurchaseOrderInputDto["pendingPurchaseItems"][number]
    > = new Map(
      input.pendingPurchaseItems.map((item) => [item.itemId, { ...item }])
    );

    const historicalPurchasesRange = this.#sheet.getRange(
      ConfirmPurchaseOrderSheetService.#DATA_RANGE
    );
    const historicalPurchases = historicalPurchasesRange
      .getValues()
      .toReversed();

    const currentDate = new Date();

    for (const historicalPurchase of historicalPurchases) {
      if (pendingPurchaseOrdersMap.size === 0) {
        break;
      }

      const itemId = generateItemId({
        providerName:
          historicalPurchase[
            ConfirmPurchaseOrderSheetService.#PROVIDER_NAME_COLUMN_INDEX
          ],
        itemName:
          historicalPurchase[
            ConfirmPurchaseOrderSheetService.#ITEM_NAME_COLUMN_INDEX
          ],
        purchaseOrderDate:
          historicalPurchase[
            ConfirmPurchaseOrderSheetService.#PURCHASE_ORDER_DATE_COLUMN_INDEX
          ],
      });

      const pendingPurchaseItem = pendingPurchaseOrdersMap.get(itemId);

      if (!pendingPurchaseItem) {
        continue;
      }

      historicalPurchase[
        ConfirmPurchaseOrderSheetService.#QUANTITY_CORRECTION_COLUMN_INDEX
      ] = pendingPurchaseItem.quantityDifference;

      historicalPurchase[
        ConfirmPurchaseOrderSheetService.#DELIVERED_DATE_COLUMN_INDEX
      ] = currentDate;

      pendingPurchaseOrdersMap.delete(itemId);
    }

    historicalPurchasesRange.setValues(historicalPurchases.toReversed());
  }
}
