import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { createServer } from "http";

const STATUS = new Map<String, String>();
const URLS = {
  Amazon: {
    url: "https://www.amazon.co.jp/gp/product/B08GG17K5G",
    query: "span[data-action=show-all-offers-display]"
  }
}

async function main() {
  const results = Promise.all(
    Object.entries(URLS).map(async ([service, { url, query }]) => {
      console.log("fetching...", url);
      const html = await fetch(url).then(it => it.text());
      console.log("parsing...")
      const { window: { document } } = new JSDOM(html, { url, pretendToBeVisual: true });
      console.log("finding...");
      const availability = document.querySelector(query);
      const status = availability?.textContent?.trim();
      console.log(service, status);
      STATUS.set(service, status ?? "???error???");
    })
  );
  next();
}

function serve() {
  const server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify([...STATUS.entries()]))
  });
  server.listen(process.env.PORT);
}

function next() {
  setTimeout(main, 100000);
}

main();
serve();
