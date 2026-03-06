import {glob} from "glob";
import path from "node:path";
import fs from "node:fs";
import YAML from "yaml";

export interface CollectionConfig {
  id: number;
  name: string;
  items: string[];
}

export async function loadCollectionConfigs(baseDir: string) {
  const files = glob.sync('**/*.*.yml', {
    cwd: baseDir
  });

  const collectionConfigMap = new Map<number, CollectionConfig>();
  for (const file of files) {
    const filePath = path.resolve(baseDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const collection = YAML.parse(content);

    if (!collection.id) {
      throw new Error(`The collection id is required in ${filePath}`);
    } else if (collectionConfigMap.has(collection.id)) {
      throw new Error(`The collection id ${collection.id} is duplicated, please allocate an unique id.`);
    }

    collectionConfigMap.set(collection.id, collection);
  }

  return collectionConfigMap;
}
