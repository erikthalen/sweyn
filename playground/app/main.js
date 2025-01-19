const res = await fetch('/api/alone')
const json = await res.json()

console.log(json)

const res2 = await fetch('/snippets/foo')
const snippet = await res2.text()
console.log(snippet)

const res3 = await fetch('/api/db/get?id=1')
const dbData = await res3.json()
document
  .getElementById('db-rows')
  ?.insertAdjacentHTML(
    'afterbegin',
    `<pre><code class="language-json">${JSON.stringify(
      dbData,
      null,
      2
    )}</code></pre>`
  )

hljs.highlightAll()

console.log(dbData)
