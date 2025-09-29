import type { NotifierService } from "@core/notifier/notifier.service";
import type { CreatePurchaseOrderService } from "./ports/create-purchase-order.service";
import type { GetOmittedItemsService } from "./ports/get-omitted-items.service";
import type { GetProviderNameService } from "./ports/get-provider-name.service";
import type { ValidateUserLocationService } from "./ports/validate-user-location.service";

export class CreatePurchaseOrderUseCase {
  readonly #notifierService: NotifierService;
  readonly #validationUserLocationService: ValidateUserLocationService;
  readonly #getOmittedItemsService: GetOmittedItemsService;
  readonly #getProviderNameService: GetProviderNameService;
  readonly #createPurchaseOrderService: CreatePurchaseOrderService;

  // biome-ignore lint/nursery/useMaxParams: Dependency injection
  constructor(
    notifierService: NotifierService,
    preconditionsValidatorService: ValidateUserLocationService,
    getOmittedItemsService: GetOmittedItemsService,
    getProviderNameService: GetProviderNameService,
    createPurchaseOrderService: CreatePurchaseOrderService
  ) {
    this.#notifierService = notifierService;
    this.#validationUserLocationService = preconditionsValidatorService;
    this.#getOmittedItemsService = getOmittedItemsService;
    this.#getProviderNameService = getProviderNameService;
    this.#createPurchaseOrderService = createPurchaseOrderService;
  }

  execute(): void {
    this.#validationUserLocationService.validateUserLocation();

    const { providerName } = this.#getProviderNameService.getProviderName();
    const { items: omittedItems } =
      this.#getOmittedItemsService.getOmittedItems();

    const isConfirmed = this.#showConfirmationDialog(
      providerName,
      omittedItems
    );

    if (!isConfirmed) {
      this.#notifierService.notify({
        message: "No se ha realizado ninguna acción",
      });
      return;
    }

    this.#createPurchaseOrderService.createPurchaseOrder({
      providerName,
      omittedItems,
    });
  }

  #showConfirmationDialog(
    providerName: string,
    omittedItems: ReadonlySet<string>
  ) {
    const messages = [
      `Se añadirá la fecha de hoy a los pedidos pendientes de '${providerName}'.`,
    ];

    if (omittedItems.size > 0) {
      messages.push("\nSe omitirán los siguientes productos:");

      for (const omittedItem of omittedItems) {
        messages.push(`- ${omittedItem}`);
      }
    }

    const formattedMessage = [...messages, "\n¿Confirmas la acción?"].join(
      "\n"
    );

    const { isConfirmed } = this.#notifierService.confirm({
      title: "Declarar orden de compra",
      message: formattedMessage,
    });

    return isConfirmed;
  }
}
