export type GetOmittedItemsOutputDto = Readonly<{
  items: ReadonlySet<string>;
}>;

export type GetOmittedItemsService = Readonly<{
  getOmittedItems(): GetOmittedItemsOutputDto;
}>;
