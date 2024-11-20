const res = await fetch('/api/some')
const json = await res.json()

console.log(json)

const res2 = await fetch('/snippets/foo')
const snippet = await res2.text()

console.log(snippet)