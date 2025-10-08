import type { NotifierService } from "@core/notifier/notifier.service";
import type { AddItemToBePurchasedUseCase } from "@features/add-item-to-be-purchased/application/add-item-to-be-purchased.use-case";
import { createAddItemToBePurchased } from "@features/add-item-to-be-purchased/domain/add-item-to-be-purchased-input.dto";
import type { ValidateUserLocationService } from "@features/shared/ports/validate-user-location.service";
import type { AdjustQuantityDifferenceService } from "./ports/adjust-quantity-difference.service";
import type { ConfirmPurchaseOrderService } from "./ports/confirm-purchase-order.service";
import type { GetPendingPurchaseItemsService } from "./ports/get-pending-purchase-items.service";

export class ConfirmPurchaseOrderUseCase {
  readonly #notifierService: NotifierService;
  readonly #getPendingPurchaseItemsService: GetPendingPurchaseItemsService;
  readonly #confirmPurchaseOrderService: ConfirmPurchaseOrderService;
  readonly #addItemToBePurchasedUseCase: AddItemToBePurchasedUseCase;
  readonly #adjustQuantityDifferenceService: AdjustQuantityDifferenceService;
  readonly #validateUserLocationService: ValidateUserLocationService;

  // biome-ignore lint/nursery/useMaxParams: Dependency injection
  constructor(
    notifierService: NotifierService,
    getPendingPurchaseItemsService: GetPendingPurchaseItemsService,
    confirmPurchaseOrderService: ConfirmPurchaseOrderService,
    addItemToBePurchasedUseCase: AddItemToBePurchasedUseCase,
    adjustQuantityDifferenceService: AdjustQuantityDifferenceService,
    validateUserLocationService: ValidateUserLocationService
  ) {
    this.#notifierService = notifierService;
    this.#getPendingPurchaseItemsService = getPendingPurchaseItemsService;
    this.#confirmPurchaseOrderService = confirmPurchaseOrderService;
    this.#addItemToBePurchasedUseCase = addItemToBePurchasedUseCase;
    this.#adjustQuantityDifferenceService = adjustQuantityDifferenceService;
    this.#validateUserLocationService = validateUserLocationService;
  }

  execute(): void {
    this.#validateUserLocationService.validateUserLocation();

    const { isConfirmed } = this.#notifierService.confirm({
      title: "Confirmar orden de compra",
      message: "¿Quieres confirmar la orden de compra?",
    });

    if (!isConfirmed) {
      this.#notifierService.notify({
        message: "No se ha realizado ninguna acción",
      });
      return;
    }

    const { pendingPurchaseItems } =
      this.#getPendingPurchaseItemsService.getPendingPurchaseItems();

    this.#confirmPurchaseOrderService.confirmPurchaseOrder({
      pendingPurchaseItems,
    });

    const itemsThatNeedsToBeOrderedAgain = pendingPurchaseItems.filter(
      ({ quantityDifference }) => quantityDifference < 0
    );

    if (itemsThatNeedsToBeOrderedAgain.length === 0) {
      return;
    }

    const { adjustedItems } =
      this.#adjustQuantityDifferenceService.adjustQuantityDifference({
        itemsToAdjust: itemsThatNeedsToBeOrderedAgain.map((item) => ({
          itemName: item.itemName,
          quantityDifference: Math.abs(item.quantityDifference),
        })),
      });

    for (const item of adjustedItems) {
      this.#addItemToBePurchasedUseCase.execute(
        createAddItemToBePurchased({
          itemName: item.itemName,
          quantity: item.quantityDifference,
        })
      );
    }
  }
}
