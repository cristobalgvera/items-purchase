export type CreatePurchaseOrderInputDto = Readonly<{
  providerName: string;
  omittedItems: ReadonlySet<string>;
}>;

export type CreatePurchaseOrderService = Readonly<{
  createPurchaseOrder(input: CreatePurchaseOrderInputDto): void;
}>;
