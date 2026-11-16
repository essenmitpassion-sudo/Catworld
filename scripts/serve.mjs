import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
const port = Number(process.env.PORT || 3000);
createServer(async (req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(204).end();
    return;
  }
  try {
    const html = await readFile(new URL("../dist/index.html", import.meta.url));
    res
      .writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      })
      .end(html);
  } catch {
    res
      .writeHead(503, { "Content-Type": "text/plain; charset=utf-8" })
      .end("Bitte zuerst npm run build ausführen.");
  }
}).listen(port, "0.0.0.0", () => console.log(`SAUM http://localhost:${port}`));
