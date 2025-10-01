import type { AddItemToBePurchasedInputDto } from "@features/add-item-to-be-purchased/domain/add-item-to-be-purchased-input.dto";

export type UpdateItemInputDto = AddItemToBePurchasedInputDto;

export type UpdateItemService = Readonly<{
  updateItem(input: UpdateItemInputDto): void;
}>;
