import { type RefGrouping, type PotentialRef } from "./types";
import { type OpenAPIV3_1 } from "openapi-types";
import pluralize from "pluralize";
import { isEqual, set, cloneDeep } from "lodash";

export const findPotentialRefs = (
  doc: Record<string, unknown>,
): PotentialRef[] => {
  const objectPaths: PotentialRef[] = [];
  const stack: [Record<string, unknown>, string[]][] = [[doc, []]];

  while (stack.length > 0) {
    const [docEntry, currentPath] = stack.pop()!;
    for (const key in docEntry) {
      const newPath = [...currentPath, key];
      if (
        key === "type" &&
        docEntry[key] === "object" &&
        typeof docEntry["properties"] !== "undefined"
      ) {
        objectPaths.push({
          path: newPath,
          definition: docEntry as Record<string, unknown>, //["properties"] as Record<string, unknown>,
        });
      } else if (typeof docEntry[key] === "object") {
        stack.push([docEntry[key] as Record<string, unknown>, newPath]);
      }
    }
  }

  return objectPaths;
};

const generateName = (path: string[]): string => {
  const nameInput = path[0];

  if (typeof nameInput === "undefined") {
    return "Ref" + Math.random().toString(36).substring(2, 15);
  }

  const [name] = nameInput.split("/").filter((str) => str.length > 0);
  const singularName = pluralize.singular(name ?? nameInput);

  return singularName.charAt(0).toUpperCase() + singularName.slice(1);
};

export const groupRefs = (refs: PotentialRef[]): RefGrouping[] => {
  const groups: RefGrouping[] = [];

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    if (ref === undefined) break;

    const group = groups.find((group) =>
      isEqual(group.definition, ref.definition),
    );

    if (group) {
      group.paths.push(ref.path);
    } else {
      groups.push({
        name: generateName(ref.path),
        definition: ref.definition,
        paths: [ref.path],
      });
    }
  }

  return groups;
};

export const applyRefs = (
  doc: OpenAPIV3_1.Document<{}>,
  refGroups: RefGrouping[],
): OpenAPIV3_1.Document => {
  const updatedDoc = cloneDeep(doc) as OpenAPIV3_1.Document;

  if (typeof updatedDoc.paths === "undefined") {
    return doc;
  }

  if (typeof updatedDoc.components === "undefined") {
    updatedDoc.components = { schemas: {} };
  } else if (typeof updatedDoc.components.schemas === "undefined") {
    updatedDoc.components.schemas = {};
  }

  for (const refgrp of refGroups) {
    for (const path of refgrp.paths) {
      set(updatedDoc.paths, path.slice(0, -1), {
        $ref: `#/components/schemas/${refgrp.name}`,
      });
    }

    if (updatedDoc?.components?.schemas) {
      updatedDoc.components.schemas[refgrp.name] =
        refgrp.definition as OpenAPIV3_1.BaseSchemaObject;
    }
  }

  return updatedDoc;
};
