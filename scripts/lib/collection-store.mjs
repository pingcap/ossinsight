// Simple YAML parser for our collection format
export function parseCollectionYaml(text) {
  const lines = text.split('\n');
  const result = { items: [] };
  let inItems = false;
  for (const line of lines) {
    if (line.startsWith('id:')) result.id = Number(line.slice(3).trim());
    else if (line.startsWith('name:')) result.name = line.slice(5).trim();
    else if (line.trim() === 'items:') inItems = true;
    else if (inItems && line.trim().startsWith('- ')) result.items.push(line.trim().slice(2).split(/\s+#/, 1)[0].trim());
  }
  return result;
}

function id(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value))) {
    throw new Error('Invalid numeric ID');
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error('Invalid numeric ID');
  return number;
}

// The serverless driver's placeholders use client-side escaping. Hex-encode text
// before binding so both ordinary SQL mode and NO_BACKSLASH_ESCAPES are safe.
function text(value) {
  if (typeof value !== 'string') throw new Error('Expected text');
  return Buffer.from(value, 'utf8').toString('hex');
}

export function validateCollection(collection, expectedId) {
  if (id(collection.id) !== id(expectedId)) throw new Error('Collection ID does not match its filename');
  if (typeof collection.name !== 'string' || !collection.name.length || collection.name.length > 200 || /[\x00-\x1f\x7f]/.test(collection.name)) {
    throw new Error('Invalid collection name');
  }
  if (!Array.isArray(collection.items) || collection.items.length > 10000 || collection.items.some(name => {
    if (typeof name !== 'string') return true;
    const [owner, repo, extra] = name.split('/');
    return extra !== undefined || !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(owner) ||
      !repo || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo) || repo === '.' || repo === '..';
  })) throw new Error('Invalid repository list');
}

export function collectionStore(db) {
  return {
    get: collectionId => db.execute('SELECT id, name FROM collections WHERE id = ?', [id(collectionId)]),
    items: collectionId => db.execute('SELECT repo_id, repo_name FROM collection_items WHERE collection_id = ? ORDER BY repo_name', [id(collectionId)]),
    create: (collectionId, name) => db.execute('INSERT INTO collections (id, name) VALUES (?, CONVERT(UNHEX(?) USING utf8mb4))', [id(collectionId), text(name)]),
    remove: (collectionId, name) => db.execute('DELETE FROM collection_items WHERE collection_id = ? AND repo_name = CONVERT(UNHEX(?) USING utf8mb4)', [id(collectionId), text(name)]),
    lookup: name => db.execute('SELECT repo_id FROM github_events WHERE repo_name = CONVERT(UNHEX(?) USING utf8mb4) AND repo_id IS NOT NULL AND repo_id != 0 ORDER BY id DESC LIMIT 1', [text(name)]),
    add: (collectionId, name, repoId) => db.execute('INSERT INTO collection_items (collection_id, repo_name, repo_id) VALUES (?, CONVERT(UNHEX(?) USING utf8mb4), ?)', [id(collectionId), text(name), id(repoId)]),
  };
}
