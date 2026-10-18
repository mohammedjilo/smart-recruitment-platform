export type AuthContext =
  | { type: "user"; id: string }
  | { type: "company"; id: string };

export type RequestId = string;
