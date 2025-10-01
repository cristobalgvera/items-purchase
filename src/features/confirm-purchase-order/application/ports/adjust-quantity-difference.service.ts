import type { GetPendingPurchaseItemsOutputDto } from "./get-pending-purchase-items.service";

type PendingPurchaseItem =
  GetPendingPurchaseItemsOutputDto["pendingPurchaseItems"][number];

export type AdjustQuantityDifferenceInputDto = Readonly<{
  itemsToAdjust: readonly Pick<
    PendingPurchaseItem,
    "itemName" | "quantityDifference"
  >[];
}>;

export type AdjustQuantityDifferenceOutputDto = Readonly<{
  adjustedItems: readonly Pick<
    PendingPurchaseItem,
    "itemName" | "quantityDifference"
  >[];
}>;

export type AdjustQuantityDifferenceService = Readonly<{
  adjustQuantityDifference(
    input: AdjustQuantityDifferenceInputDto
  ): AdjustQuantityDifferenceOutputDto;
}>;
