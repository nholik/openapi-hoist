import { writeFile } from "node:fs/promises";
import SwaggerParser from "@apidevtools/swagger-parser";
import { type OpenAPIV3_1 } from "openapi-types";
import { applyRefs, findPotentialRefs, groupRefs } from "./util.js";

const main = async () => {
  try {
    const parser = new SwaggerParser();
    const doc = await parser.validate("./test-specs/book-schema.json");
    const results = findPotentialRefs(doc.paths as Record<string, unknown>);
    const refGroups = groupRefs(results);
    const updatedDoc = applyRefs(doc as OpenAPIV3_1.Document, refGroups);
    console.log(updatedDoc);
    const blah = JSON.stringify(updatedDoc, null, 2);
    await writeFile("./test-specs/book-refs.json", blah);
  } catch (e) {
    console.error(e);
  }
};

main();
