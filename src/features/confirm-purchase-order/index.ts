import { notifierService } from "@core/notifier";
import { addItemToBePurchasedUseCase } from "@features/add-item-to-be-purchased";
import { ConfirmPurchaseOrderUseCase } from "./application/confirm-purchase-order.use-case";
import type { AdjustQuantityDifferenceService } from "./application/ports/adjust-quantity-difference.service";
import type { ConfirmPurchaseOrderService } from "./application/ports/confirm-purchase-order.service";
import type { GetPendingPurchaseItemsService } from "./application/ports/get-pending-purchase-items.service";
import { AdjustQuantityDifferenceSheetService } from "./infrastructure/adjust-quantity-difference-sheet.service";
import { ConfirmPurchaseOrderSheetService } from "./infrastructure/confirm-purchase-order-sheet.service";
import { GetPendingPurchaseItemsSheetService } from "./infrastructure/get-pending-purchase-items-sheet.service";

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const purchasedOrdersSheet = spreadsheet.getSheetByName("Pedidos realizados");

if (!purchasedOrdersSheet) {
  throw new Error("No se ha encontrado la hoja de pedidos realizados");
}

const historicalPurchaseOrdersSheet =
  spreadsheet.getSheetByName("Pedidos históricos");

if (!historicalPurchaseOrdersSheet) {
  throw new Error("No se ha encontrado la hoja de pedidos históricos");
}

const itemsSheet = spreadsheet.getSheetByName("Productos");

if (!itemsSheet) {
  throw new Error("No se ha encontrado la hoja de productos");
}

const getPendingPurchaseItemsService: GetPendingPurchaseItemsService =
  new GetPendingPurchaseItemsSheetService(purchasedOrdersSheet);

const confirmPurchaseOrderService: ConfirmPurchaseOrderService =
  new ConfirmPurchaseOrderSheetService(historicalPurchaseOrdersSheet);

const adjustQuantityDifferenceService: AdjustQuantityDifferenceService =
  new AdjustQuantityDifferenceSheetService(itemsSheet);

export const confirmPurchaseOrderUseCase = new ConfirmPurchaseOrderUseCase(
  notifierService,
  getPendingPurchaseItemsService,
  confirmPurchaseOrderService,
  addItemToBePurchasedUseCase,
  adjustQuantityDifferenceService
);
