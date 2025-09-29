export type DomainExceptionDto = Readonly<{
  message: string;
  title?: string;
}>;

export class DomainException extends Error {
  readonly title: string | undefined;

  constructor(domainException: DomainExceptionDto) {
    super(domainException.message);

    this.name = DomainException.name;
    this.title = domainException.title;
  }
}
