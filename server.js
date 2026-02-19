import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 10000;

// HTTP server required for Render
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server running");
});

const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  broadcast({ type: "system", text: "user joined" });

  ws.on("message", (data) => {
    broadcast(JSON.parse(data.toString()));
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcast({ type: "system", text: "user left" });
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const c of clients) {
    if (c.readyState === 1) c.send(msg);
  }
}

server.listen(PORT, () => console.log("running on", PORT));
