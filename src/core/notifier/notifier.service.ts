type BaseNotifyInputDto = Readonly<{
  message: string;
  title?: string;
}>;

export type NotifyInputDto = BaseNotifyInputDto;
export type ConfirmInputDto = BaseNotifyInputDto;

export type ConfirmOutputDto = Readonly<{
  isConfirmed: boolean;
}>;

export type NotifierService = Readonly<{
  notify(input: NotifyInputDto): void;
  confirm(input: ConfirmInputDto): ConfirmOutputDto;
}>;
