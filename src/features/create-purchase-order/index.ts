import { SHEET_ID } from "@core/constants/sheet-id.constant";
import { notifierService } from "@core/notifier";
import { getSheetById } from "@core/utils/get-sheet-by-id.util";
import { CreatePurchaseOrderUseCase } from "./application/create-purchase-order.use-case";
import type { CreatePurchaseOrderService } from "./application/ports/create-purchase-order.service";
import type { GetOmittedItemsService } from "./application/ports/get-omitted-items.service";
import type { GetProviderNameService } from "./application/ports/get-provider-name.service";
import type { ValidateUserLocationService } from "./application/ports/validate-user-location.service";
import { CreatePurchaseOrderSheetService } from "./infrastructure/create-purchase-order-sheet.service";
import { GetOmittedItemsSheetService } from "./infrastructure/get-omitted-items-sheet.service";
import { GetProviderNameSheetService } from "./infrastructure/get-provider-name-sheet.service";
import { ValidateUserLocationSpreadsheetService } from "./infrastructure/validate-user-location-spreadsheet.service";

const activeSheet = SpreadsheetApp.getActiveSheet();
const orderToBeDoneSheet = getSheetById(SHEET_ID.ORDER_TO_BE_DONE);
const historicalOrdersSheet = getSheetById(SHEET_ID.HISTORICAL_ORDERS);
const purchaseOrdersByProviderSheet = getSheetById(
  SHEET_ID.PURCHASE_ORDERS_BY_PROVIDER
);

const validateUserLocationService: ValidateUserLocationService =
  new ValidateUserLocationSpreadsheetService(orderToBeDoneSheet, activeSheet);

const getOmittedItemsService: GetOmittedItemsService =
  new GetOmittedItemsSheetService(activeSheet);

const getProviderNameService: GetProviderNameService =
  new GetProviderNameSheetService(activeSheet);

const createPurchaseOrderService: CreatePurchaseOrderService =
  new CreatePurchaseOrderSheetService(
    purchaseOrdersByProviderSheet,
    historicalOrdersSheet,
    orderToBeDoneSheet
  );

export const createPurchaseOrderUseCase = new CreatePurchaseOrderUseCase(
  notifierService,
  validateUserLocationService,
  getOmittedItemsService,
  getProviderNameService,
  createPurchaseOrderService
);
