import type { NotifierService } from "@core/notifier/notifier.service";
import type { AddItemToBePurchasedUseCase } from "@features/add-item-to-be-purchased/application/add-item-to-be-purchased.use-case";
import { createAddItemToBePurchased } from "@features/add-item-to-be-purchased/domain/add-item-to-be-purchased-input.dto";
import type { ValidateUserLocationService } from "@features/shared/ports/validate-user-location.service";
import type { AdjustQuantityDifferenceService } from "./ports/adjust-quantity-difference.service";
import type { ConfirmPurchaseOrderService } from "./ports/confirm-purchase-order.service";
import type {
  GetPendingPurchaseItemsService,
  PendingPurchaseItem,
} from "./ports/get-pending-purchase-items.service";

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

    const { pendingPurchaseItems } =
      this.#getPendingPurchaseItemsService.getPendingPurchaseItems();

    const itemsThatNeedsToBeOrderedAgain = pendingPurchaseItems.filter(
      ({ quantityDifference }) => quantityDifference < 0
    );

    const isConfirmed = this.#showConfirmationDialog(
      pendingPurchaseItems,
      itemsThatNeedsToBeOrderedAgain
    );

    if (!isConfirmed) {
      this.#notifierService.notify({
        message: "No se ha realizado ninguna acción",
      });
      return;
    }

    this.#confirmPurchaseOrderService.confirmPurchaseOrder({
      pendingPurchaseItems,
    });

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

  #showConfirmationDialog(
    pendingPurchaseItems: readonly PendingPurchaseItem[],
    itemsThatNeedsToBeOrderedAgain: readonly PendingPurchaseItem[]
  ): boolean {
    const messages = [
      "Será confirmada la recepción de los siguientes productos:",
      ...pendingPurchaseItems.map((item) => `- ${item.itemName}`),
    ];

    if (itemsThatNeedsToBeOrderedAgain.length > 0) {
      messages.push(
        ...[
          "\nLos siguientes productos serán organizados para ser ordenados nuevamente debido a diferencias en la cantidad recepcionada:",
          ...itemsThatNeedsToBeOrderedAgain.map(
            (item) =>
              `- ${item.itemName} (-${Math.abs(item.quantityDifference)} u)`
          ),
        ]
      );
    }

    const { isConfirmed } = this.#notifierService.confirm({
      title: "Confirmar recepción de productos",
      message: messages
        .concat("\n¿Quieres confirmar la recepción de los productos?")
        .join("\n"),
    });

    return isConfirmed;
  }
}
