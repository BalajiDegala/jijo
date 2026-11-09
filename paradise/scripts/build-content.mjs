import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const guides = JSON.parse(await readFile('src/guides.json', 'utf8'))
const wordingEdits = JSON.parse(await readFile('scripts/website-wording.json', 'utf8'))

// Keep the source files intact and use learning-focused wording on the website.
function websiteWording(text) {
  const result = wordingEdits.reduce(
    (value, [before, after]) => value.replaceAll(before, after),
    text,
  )
  if (/interview|questions?|quetions?/i.test(result))
    throw new Error('Review the website wording before publishing this content.')
  return result
}

await mkdir('public/content', { recursive: true })
for (const [id, guide] of Object.entries(guides)) {
  const source = `docs/mdfiles/${guide.source}`
  const original = await readFile(source, 'utf8')
  const markdown = original.replaceAll('\r\n', '\n')
  const headings = [...markdown.matchAll(/^### Q(\d+): (.+)$/gm)]
  const index = [...markdown.matchAll(/^- Q(\d+): (.+)$/gm)]
  const sections = [...markdown.matchAll(/^## Section (\d+) - (.+?)(?: \(Q\d+-Q\d+\))?$/gm)]

  if (headings.length !== guide.topics || headings.length !== index.length)
    throw new Error(`${guide.title}: the topic bodies must match the source index.`)

  const questions = headings.map((heading, i) => {
    const number = Number(heading[1])
    if (number !== i + 1 || heading[1] !== index[i][1] || heading[2] !== index[i][2])
      throw new Error(`${guide.title}: topic ${number} does not match the source index.`)
    const section = sections.findLast((item) => item.index < heading.index)
    if (!section) throw new Error(`Topic ${number} has no section.`)

    // Section boundaries and closing study tips are not part of a topic.
    const start = heading.index + heading[0].length
    const remainder = markdown.slice(start, headings[i + 1]?.index ?? markdown.length)
    const boundary = remainder.search(/^## /m)
    const answer = (boundary < 0 ? remainder : remainder.slice(0, boundary)).trim()
    if (!answer) throw new Error(`Topic ${number} has no content.`)

    return {
      number,
      title: websiteWording(heading[2]),
      section: websiteWording(section[2]),
      markdown: websiteWording(answer),
    }
  })

  await writeFile(
    `public/content/${guide.output}`,
    JSON.stringify({
      version: 1,
      id,
      title: guide.title,
      source: guide.source,
      sourceHash: createHash('sha256').update(original).digest('hex'),
      questions,
    }) + '\n',
  )
  console.log(`Imported all ${questions.length} topics from ${source}.`)
}
