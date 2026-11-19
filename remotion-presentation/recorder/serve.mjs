import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Number(process.argv[2] ?? 4177);
const [html, script] = await Promise.all(
  ["index.html", "recorder.js"].map((name) =>
    readFile(new URL(name, import.meta.url)),
  ),
);
// A loopback origin provides browser capture permissions. Media stays in the tab.
const server = createServer((req, res) => {
  const pathname = req.url?.split("?", 1)[0];
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
  } else if (pathname === "/" || pathname === "/index.html") {
    res
      .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      .end(html);
  } else if (pathname === "/recorder.js") {
    res
      .writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" })
      .end(script);
  } else {
    res.writeHead(404).end();
  }
});
server.on("error", (error) => {
  console.error("无法启动录制页：", error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`演示录制  http://127.0.0.1:${server.address().port}/`);
});
