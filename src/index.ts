/** biome-ignore-all lint/correctness/noUnusedVariables: This file groups all functions that will be used externally */

import { withExceptionHandler } from "@core/exceptions/exception.handler";
import { createPurchaseOrderUseCase } from "@features/create-purchase-order";

function createPurchaseOrder(): void {
  withExceptionHandler(() => {
    createPurchaseOrderUseCase.execute();
  });
}

// @ts-expect-error
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu("Pedidos")
    .addItem("Realizar pedido", createPurchaseOrder.name)
    .addToUi();
}
