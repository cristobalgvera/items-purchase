export type GenerateItemIdInputDto = Readonly<{
  providerName: string;
  itemName: string;
  purchaseOrderDate: Date;
}>;

export function generateItemId({
  itemName,
  providerName,
  purchaseOrderDate,
}: GenerateItemIdInputDto): string {
  return [providerName, itemName, purchaseOrderDate.toLocaleDateString("es-CL")]
    .join("-")
    .replace(/\s+/g, "-");
}
