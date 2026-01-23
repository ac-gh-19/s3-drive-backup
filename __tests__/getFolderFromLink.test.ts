jest.mock("../src/utils/folderLink", () => ({
  extractFolderIdFromLink: jest.fn(),
}));

import { getFolderFromLink } from "../src/client/driveFolders";
import { extractFolderIdFromLink } from "../src/utils/folderLink";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";

describe("getFolderFromLink", () => {
  const mockDriveClient = {
    files: {
      get: jest.fn(),
    },
  } as unknown as drive_v3.Drive;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns folder id and name when Drive confirms it is a folder", async () => {
    (extractFolderIdFromLink as jest.Mock).mockReturnValue("123");

    (mockDriveClient.files.get as jest.Mock).mockResolvedValue({
      data: {
        id: "123",
        name: "My Folder",
        mimeType: "application/vnd.google-apps.folder",
      },
    });

    const result = await getFolderFromLink(
      mockDriveClient,
      "/drive/folders/123",
    );

    expect(result).toEqual({
      id: "123",
      name: "My Folder",
    });
  });

  it("returns null when Drive says the ID exists but is not a folder", async () => {
    (extractFolderIdFromLink as jest.Mock).mockReturnValue("123");

    (mockDriveClient.files.get as jest.Mock).mockResolvedValue({
      data: {
        id: "123",
        name: "file.txt",
        mimeType: "text/plain",
      },
    });

    const result = await getFolderFromLink(
      mockDriveClient,
      "/drive/folders/123",
    );

    expect(result).toBeNull();
  });

  it("returns null when Drive throws (invalid or inaccessible folder)", async () => {
    (extractFolderIdFromLink as jest.Mock).mockReturnValue("123");

    (mockDriveClient.files.get as jest.Mock).mockRejectedValue(
      new Error("File not found"),
    );

    const result = await getFolderFromLink(
      mockDriveClient,
      "/drive/folders/123",
    );

    expect(result).toBeNull();
  });

  it("returns null and never calls Drive when link is invalid", async () => {
    (extractFolderIdFromLink as jest.Mock).mockReturnValue(null);

    const result = await getFolderFromLink(
      mockDriveClient,
      "not-a-drive-link",
    );

    expect(result).toBeNull();
    expect(mockDriveClient.files.get).not.toHaveBeenCalled();
  });
});
