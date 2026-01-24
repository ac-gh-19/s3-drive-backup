import { describe, expect, test } from "@jest/globals";
import { extractFolderIdFromLink } from "../src/utils/folderLink";

describe("Drive Folder Link", () => {
  test("return extracted folder ID from link with url params", () => {
    expect(
      extractFolderIdFromLink(
        "https://drive.google.com/drive/folders/some_folder_id?usp=sharing",
      ),
    ).toBe("some_folder_id");
  });

  test("return extracted folder ID from link without url params", () => {
    expect(
      extractFolderIdFromLink(
        "https://drive.google.com/drive/folders/some_folder_id",
      ),
    ).toBe("some_folder_id");
  });

  test("return null for invalid folder link", () => {
    expect(
      extractFolderIdFromLink(
        "https://drive.google.com/drive/invalid/some_folder_id",
      ),
    ).toBeNull();
  });
});
