import SwaggerParser from "@apidevtools/swagger-parser";

// read the file
// parse the file
// gather each response object with path and add to map

type ResponseMethod = "get" | "post" | "put" | "patch" | "delete";

const isResponseMethod = (method: string): method is ResponseMethod => {
  return ["get", "post", "put", "patch", "delete"].includes(method);
};

const main = async () => {
  try {
    const parser = new SwaggerParser();
    const doc = await parser.validate("./test-specs/book-schema.json");
    console.log(doc);
    for (const path of doc.paths) {
      const keyPath = [];
      for (const maybeMethod in path) {
        if (isResponseMethod(maybeMethod)) {
          keyPath.push(maybeMethod);
          //continue traversing until we find type of 'object'
          //if we find type of 'object', add to map
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

main();
