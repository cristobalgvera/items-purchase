export type GetProviderNameOutputDto = Readonly<{
  providerName: string;
}>;

export type GetProviderNameService = Readonly<{
  getProviderName(): GetProviderNameOutputDto;
}>;
