export type PendingPurchaseItem = Readonly<{
  itemId: string;
  itemName: string;
  quantityDifference: number;
}>;

export type GetPendingPurchaseItemsOutputDto = Readonly<{
  pendingPurchaseItems: readonly PendingPurchaseItem[];
}>;

export type GetPendingPurchaseItemsService = Readonly<{
  getPendingPurchaseItems(): GetPendingPurchaseItemsOutputDto;
}>;
