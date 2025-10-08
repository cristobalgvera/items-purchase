import { SHEET_ID } from "@core/constants/sheet-id.constant";
import { notifierService } from "@core/notifier";
import { getSheetById } from "@core/utils/get-sheet-by-id.util";
import { addItemToBePurchasedUseCase } from "@features/add-item-to-be-purchased";
import { ConfirmPurchaseOrderUseCase } from "./application/confirm-purchase-order.use-case";
import type { AdjustQuantityDifferenceService } from "./application/ports/adjust-quantity-difference.service";
import type { ConfirmPurchaseOrderService } from "./application/ports/confirm-purchase-order.service";
import type { GetPendingPurchaseItemsService } from "./application/ports/get-pending-purchase-items.service";
import { AdjustQuantityDifferenceSheetService } from "./infrastructure/adjust-quantity-difference-sheet.service";
import { ConfirmPurchaseOrderSheetService } from "./infrastructure/confirm-purchase-order-sheet.service";
import { GetPendingPurchaseItemsSheetService } from "./infrastructure/get-pending-purchase-items-sheet.service";

const purchasedOrdersSheet = getSheetById(SHEET_ID.PURCHASED_ORDERS);
const historicalPurchaseOrdersSheet = getSheetById(SHEET_ID.HISTORICAL_ORDERS);
const itemsSheet = getSheetById(SHEET_ID.ITEMS);

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
