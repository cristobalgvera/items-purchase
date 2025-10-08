/** biome-ignore-all lint/style/noMagicNumbers: Test file */

import { createMock } from "@golevelup/ts-jest";
import { AdjustQuantityDifferenceSheetService } from "./adjust-quantity-difference-sheet.service";

describe("AdjustQuantityDifferenceSheetService", () => {
  let underTest: AdjustQuantityDifferenceSheetService;
  let sheet: jest.Mocked<GoogleAppsScript.Spreadsheet.Sheet>;

  beforeEach(() => {
    sheet = createMock();

    underTest = new AdjustQuantityDifferenceSheetService(sheet);
  });

  describe("adjustQuantityDifference", () => {
    let dataRange: jest.Mocked<GoogleAppsScript.Spreadsheet.Range>;

    beforeEach(() => {
      dataRange = createMock<typeof dataRange>({
        getValues: jest.fn().mockReturnValue([]),
      });

      sheet.getDataRange.mockReturnValue(dataRange);
    });

    it.each([
      {
        desc: "items received are more than expected",
        itemsPerDisplay: 10,
        missingItems: 15,
        expectedMissing: 2,
      },
      {
        desc: "items received are more than expected",
        itemsPerDisplay: 10,
        missingItems: 34,
        expectedMissing: 3,
      },
      {
        desc: "items received are more than expected",
        itemsPerDisplay: 10,
        missingItems: 36,
        expectedMissing: 4,
      },
      {
        desc: "items received are less than expected",
        itemsPerDisplay: 10,
        missingItems: 7,
        expectedMissing: 1,
      },
      {
        desc: "items received are exactly half of expected",
        itemsPerDisplay: 10,
        missingItems: 5,
        expectedMissing: 1,
      },
    ])(
      "should adjusts quantity difference for valid items when $desc",
      ({ itemsPerDisplay, missingItems, expectedMissing }) => {
        const itemName = "ItemA";

        dataRange.getValues.mockReturnValueOnce([
          [itemName, "", "", itemsPerDisplay],
        ]);

        const actual = underTest.adjustQuantityDifference({
          itemsToAdjust: [{ itemName, missingQuantity: missingItems }],
        });

        expect(actual.adjustedItems).toEqual([
          { itemName, missingQuantity: expectedMissing },
        ]);
      }
    );

    it.each([
      {
        desc: "all items received",
        itemsPerDisplay: 10,
        missingItems: 0,
      },
      {
        desc: "items received are less than half of expected",
        itemsPerDisplay: 10,
        missingItems: 4,
      },
    ])(
      "should filters out items when $desc",
      ({ itemsPerDisplay, missingItems }) => {
        const itemName = "ItemA";

        dataRange.getValues.mockReturnValueOnce([
          [itemName, "", "", itemsPerDisplay],
          ["ItemB", "", "", 5],
        ]);

        const actual = underTest.adjustQuantityDifference({
          itemsToAdjust: [
            { itemName, missingQuantity: missingItems },
            { itemName: "ItemB", missingQuantity: 5 }, // INFO: Dummy value to ensure other items are kept
          ],
        });

        expect(actual.adjustedItems).toBeArrayOfSize(1);
        expect(actual.adjustedItems).toEqual([
          expect.objectContaining({ itemName: "ItemB" }),
        ]);
      }
    );

    describe("when item not found", () => {
      it("should throws an exception", () => {
        expect(() =>
          underTest.adjustQuantityDifference({
            itemsToAdjust: [{ itemName: "ItemX" } as any],
          })
        ).toThrowErrorMatchingInlineSnapshot(`"Item not found: ItemX"`);
      });
    });
  });
});
