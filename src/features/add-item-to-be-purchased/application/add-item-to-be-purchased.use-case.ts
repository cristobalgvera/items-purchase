import type { AddItemToBePurchasedInputDto } from "../domain/add-item-to-be-purchased-input.dto";
import type { CreateItemService } from "./ports/create-item.service";
import type { UpdateItemService } from "./ports/update-item.service";
import type { ValidateItemExistsService } from "./ports/validate-item-exists.service";

export class AddItemToBePurchasedUseCase {
  readonly #validateItemExistsService: ValidateItemExistsService;
  readonly #createItemService: CreateItemService;
  readonly #updateItemService: UpdateItemService;

  constructor(
    validateItemExistsService: ValidateItemExistsService,
    createItemService: CreateItemService,
    updateItemService: UpdateItemService
  ) {
    this.#validateItemExistsService = validateItemExistsService;
    this.#createItemService = createItemService;
    this.#updateItemService = updateItemService;
  }

  execute(input: AddItemToBePurchasedInputDto): void {
    const { itemExists } = this.#validateItemExistsService.validateItemExists({
      itemName: input.itemName,
    });

    if (!itemExists) {
      this.#createItemService.createItem(input);
      return;
    }

    this.#updateItemService.updateItem(input);
  }
}
