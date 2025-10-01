export type ValidateItemExistsInputDto = Readonly<{
  itemName: string;
}>;

export type ValidateItemExistsOutputDto = Readonly<{
  itemExists: boolean;
}>;

export type ValidateItemExistsService = Readonly<{
  validateItemExists(
    input: ValidateItemExistsInputDto
  ): ValidateItemExistsOutputDto;
}>;
