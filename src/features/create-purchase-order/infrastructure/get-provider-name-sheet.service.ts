import { DomainException } from "@core/exceptions/domain.exception";
import type {
  GetProviderNameOutputDto,
  GetProviderNameService,
} from "../application/ports/get-provider-name.service";

export class GetProviderNameSheetService implements GetProviderNameService {
  static readonly #PROVIDER_NAME_CELL_RANGE = "B1";

  readonly #sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.#sheet = sheet;
  }

  getProviderName(): GetProviderNameOutputDto {
    const providerName: string | undefined = this.#sheet
      .getRange(GetProviderNameSheetService.#PROVIDER_NAME_CELL_RANGE)
      .getValue();

    if (!providerName) {
      throw new DomainException({
        message: "No se ha podido obtener el nombre del proveedor",
      });
    }

    return {
      providerName,
    };
  }
}
