import { notifierService } from "@core/notifier";
import { CreatePurchaseOrderUseCase } from "./application/create-purchase-order.use-case";
import type { CreatePurchaseOrderService } from "./application/ports/create-purchase-order.service";
import type { GetOmittedItemsService } from "./application/ports/get-omitted-items.service";
import type { GetProviderNameService } from "./application/ports/get-provider-name.service";
import type { ValidateUserLocationService } from "./application/ports/validate-user-location.service";
import { CreatePurchaseOrderSheetService } from "./infrastructure/create-purchase-order-sheet.service";
import { GetOmittedItemsSheetService } from "./infrastructure/get-omitted-items-sheet.service";
import { GetProviderNameSheetService } from "./infrastructure/get-provider-name-sheet.service";
import { ValidateUserLocationSpreadsheetService } from "./infrastructure/validate-user-location-spreadsheet.service";

const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const activeSheet = activeSpreadsheet.getActiveSheet();

const validateUserLocationService: ValidateUserLocationService =
  new ValidateUserLocationSpreadsheetService(activeSpreadsheet);

const getOmittedItemsService: GetOmittedItemsService =
  new GetOmittedItemsSheetService(activeSheet);

const getProviderNameService: GetProviderNameService =
  new GetProviderNameSheetService(activeSheet);

const createPurchaseOrderService: CreatePurchaseOrderService =
  new CreatePurchaseOrderSheetService(activeSpreadsheet);

export const createPurchaseOrderUseCase = new CreatePurchaseOrderUseCase(
  notifierService,
  validateUserLocationService,
  getOmittedItemsService,
  getProviderNameService,
  createPurchaseOrderService
);
