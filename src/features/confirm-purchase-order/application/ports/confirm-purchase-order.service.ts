import type { GetPendingPurchaseItemsOutputDto } from "./get-pending-purchase-items.service";

export type ConfirmPurchaseOrderInputDto = Pick<
  GetPendingPurchaseItemsOutputDto,
  "pendingPurchaseItems"
>;

export type ConfirmPurchaseOrderService = Readonly<{
  confirmPurchaseOrder(input: ConfirmPurchaseOrderInputDto): void;
}>;
