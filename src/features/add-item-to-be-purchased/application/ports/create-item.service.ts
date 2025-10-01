import type { AddItemToBePurchasedInputDto } from "@features/add-item-to-be-purchased/domain/add-item-to-be-purchased-input.dto";

export type CreateItemInputDto = AddItemToBePurchasedInputDto;

export type CreateItemService = Readonly<{
  createItem(input: CreateItemInputDto): void;
}>;
