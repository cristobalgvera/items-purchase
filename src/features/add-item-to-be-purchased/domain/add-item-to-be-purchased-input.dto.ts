import type { Branded, Unbranded } from "@core/utils/branded.type";

export type AddItemToBePurchasedInputDto = Branded<
  Readonly<{
    itemName: string;
    quantity: number;
  }>,
  "AddItemToBePurchasedInputDto"
>;

export function createAddItemToBePurchased({
  itemName,
  quantity,
}: Unbranded<AddItemToBePurchasedInputDto>): AddItemToBePurchasedInputDto {
  if (itemName.trim() === "") {
    throw new Error("Item name cannot be empty");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  return {
    itemName: itemName.trim(),
    quantity,
  } as AddItemToBePurchasedInputDto;
}
