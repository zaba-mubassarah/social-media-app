type CursorValue = {
  createdAt: string;
  id: string;
};

export const encodeCursor = (createdAt: Date, id: string): string =>
  Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString("base64url");

export const decodeCursor = (cursor: string): CursorValue => {
  const decoded = Buffer.from(cursor, "base64url").toString("utf8");
  const parsed = JSON.parse(decoded) as CursorValue;
  return parsed;
};
