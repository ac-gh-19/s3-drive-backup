import Database from "better-sqlite3";
import { initializeDB } from "../src/db/setup";
import { createDriveFileRepository } from "../src/db/driveFiles";

describe("drive_files repository (sqlite integration)", () => {
  let db: Database.Database;
  let repo: ReturnType<typeof createDriveFileRepository>;

  beforeEach(() => {
    // Fresh isolated DB for every test
    db = new Database(":memory:");
    initializeDB(db);
    repo = createDriveFileRepository(db);
  });

  it("returns null when a drive_id does not exist", () => {
    const row = repo.get("missing-id");
    expect(row).toBeNull();
  });

  it("inserts and reads back a record", () => {
    repo.insert("abc", "md5-1", "s3/key/1.jpg");

    const row = repo.get("abc");
    expect(row).not.toBeNull();
    expect(row).toEqual({
      drive_id: "abc",
      md5Checksum: "md5-1",
      s3Key: "s3/key/1.jpg",
    });
  });

  it("updates an existing record", () => {
    repo.insert("abc", "md5-1", "s3/key/1.jpg");

    repo.update("abc", "md5-2", "s3/key/2.jpg");

    const row = repo.get("abc");
    expect(row).toEqual({
      drive_id: "abc",
      md5Checksum: "md5-2",
      s3Key: "s3/key/2.jpg",
    });
  });
});
