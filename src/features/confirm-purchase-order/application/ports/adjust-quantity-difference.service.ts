import type { GetPendingPurchaseItemsOutputDto } from "./get-pending-purchase-items.service";

type ItemToAdjustDto = Readonly<
  Pick<
    GetPendingPurchaseItemsOutputDto["pendingPurchaseItems"][number],
    "itemName"
  > & {
    missingQuantity: number;
  }
>;

export type AdjustQuantityDifferenceInputDto = Readonly<{
  itemsToAdjust: readonly ItemToAdjustDto[];
}>;

export type AdjustQuantityDifferenceOutputDto = Readonly<{
  adjustedItems: readonly ItemToAdjustDto[];
}>;

export type AdjustQuantityDifferenceService = Readonly<{
  adjustQuantityDifference(
    input: AdjustQuantityDifferenceInputDto
  ): AdjustQuantityDifferenceOutputDto;
}>;
