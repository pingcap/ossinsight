import fs from 'fs/promises';

async function rewrite (fn, mutate) {
  const content = await fs.readFile(fn, { encoding: 'utf-8' })
  let newContent
  if ((newContent = mutate(content))) {
    await fs.writeFile(fn, newContent, { encoding: 'utf-8' })
  }
}

await rewrite('node_modules/@docusaurus/core/lib/client/exports/Link.js', content => {
  return content.replaceAll('noopener noreferrer', 'noopener')
})
