import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 10000;

// MUST have an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

// attach WS to HTTP upgrade
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

const clients = new Set();

wss.on("connection", (ws) => {
  console.log("connected");
  clients.add(ws);

  ws.send(JSON.stringify({ type: "system", text: "connected to server" }));

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      msg = { type: "text", text: data.toString() };
    }

    const out = JSON.stringify(msg);

    for (const c of clients) {
      if (c.readyState === 1) c.send(out);
    }
  });

  ws.on("close", () => clients.delete(ws));
});

server.listen(PORT, () => console.log("running on", PORT));
