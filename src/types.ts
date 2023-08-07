// export type ResponseMethod = "get" | "post" | "put" | "patch" | "delete";

// export const isResponseMethod = (method: string): method is ResponseMethod => {
//   return ["get", "post", "put", "patch", "delete"].includes(method);
// };

// export type NestedItem = NestedObj | Record<string, NestedObj>;
// export type NestedObj = Record<string, NestedItem>;

export type PotentialRef = {
  path: string[];
  definition: Record<string, unknown>;
};

export type RefGrouping = {
  name: string;
  definition: Record<string, unknown>;
  paths: string[][];
}