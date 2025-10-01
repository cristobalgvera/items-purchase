import { AddItemToBePurchasedUseCase } from "./application/add-item-to-be-purchased.use-case";
import type { CreateItemService } from "./application/ports/create-item.service";
import type { UpdateItemService } from "./application/ports/update-item.service";
import type { ValidateItemExistsService } from "./application/ports/validate-item-exists.service";
import { CreateItemSheetService } from "./infrastructure/create-item-sheet.service";
import { UpdateItemSheetService } from "./infrastructure/update-item-sheet.service";
import { ValidateItemExistsSheetService } from "./infrastructure/validate-item-exists-sheet.service";

const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const purchaseOrdersByProviderSheet = activeSpreadsheet.getSheetByName(
  "Pedidos por proveedor"
);

if (!purchaseOrdersByProviderSheet) {
  throw new Error("Sheet 'Pedidos por proveedor' not found");
}

const validateItemExistsService: ValidateItemExistsService =
  new ValidateItemExistsSheetService(purchaseOrdersByProviderSheet);

const createItemService: CreateItemService = new CreateItemSheetService(
  purchaseOrdersByProviderSheet
);

const updateItemService: UpdateItemService = new UpdateItemSheetService(
  purchaseOrdersByProviderSheet
);

export const addItemToBePurchasedUseCase = new AddItemToBePurchasedUseCase(
  validateItemExistsService,
  createItemService,
  updateItemService
);
