import { DomainException } from "@core/exceptions/domain.exception";
import type { ValidateUserLocationService } from "../application/ports/validate-user-location.service";

export class ValidateUserLocationSpreadsheetService
  implements ValidateUserLocationService
{
  static readonly #ORDER_TO_BE_DONE_SHEET_NAME = "Pedido por realizar";

  readonly #spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    this.#spreadsheet = spreadsheet;
  }

  validateUserLocation(): void {
    const orderToBeDoneSheet = this.#spreadsheet.getSheetByName(
      ValidateUserLocationSpreadsheetService.#ORDER_TO_BE_DONE_SHEET_NAME
    );

    if (!orderToBeDoneSheet) {
      throw new DomainException({
        message: `No se ha encontrado la hoja '${ValidateUserLocationSpreadsheetService.#ORDER_TO_BE_DONE_SHEET_NAME}'`,
      });
    }

    const activeSheet = this.#spreadsheet.getActiveSheet();

    if (activeSheet.getSheetId() !== orderToBeDoneSheet.getSheetId()) {
      throw new DomainException({
        message: `Debes estar en la hoja '${ValidateUserLocationSpreadsheetService.#ORDER_TO_BE_DONE_SHEET_NAME}' para ejecutar esta acción`,
      });
    }
  }
}
