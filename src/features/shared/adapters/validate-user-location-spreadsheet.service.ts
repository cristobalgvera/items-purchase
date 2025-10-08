import { DomainException } from "@core/exceptions/domain.exception";
import type { ValidateUserLocationService } from "../ports/validate-user-location.service";

export class ValidateUserLocationSpreadsheetService
  implements ValidateUserLocationService
{
  readonly #requiredLocationSheet: GoogleAppsScript.Spreadsheet.Sheet;
  readonly #activeSheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(
    requiredLocationSheet: GoogleAppsScript.Spreadsheet.Sheet,
    activeSheet: GoogleAppsScript.Spreadsheet.Sheet
  ) {
    this.#requiredLocationSheet = requiredLocationSheet;
    this.#activeSheet = activeSheet;
  }

  validateUserLocation(): void {
    if (
      this.#activeSheet.getSheetId() !==
      this.#requiredLocationSheet.getSheetId()
    ) {
      throw new DomainException({
        message: `Debes estar en la hoja '${this.#requiredLocationSheet.getSheetName()}' para ejecutar esta acción`,
      });
    }
  }
}
