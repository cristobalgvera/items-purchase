export type GetSheetByIdOpts = Readonly<
  Partial<{
    /** The spreadsheet to retrieve the sheet from. Defaults to the active spreadsheet. */
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  }>
>;

/**
 * Get a sheet by its ID, throwing an error if not found.
 *
 * @param sheetId The ID of the sheet to retrieve.
 * @param opts Optional configuration options.
 *
 * @returns The sheet with the specified ID.
 *
 * @throws {Error} If the sheet with the specified ID is not found.
 */
export function getSheetById(
  sheetId: number,
  opts?: GetSheetByIdOpts
): GoogleAppsScript.Spreadsheet.Sheet {
  const { spreadsheet = SpreadsheetApp.getActiveSpreadsheet() } = opts ?? {};

  const sheet = spreadsheet.getSheetById(sheetId);

  if (!sheet) {
    throw new Error(`No se ha encontrado la hoja con ID '${sheetId}'`);
  }

  return sheet;
}
