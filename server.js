import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 10000;

/* ---------- HTTP (Render health check) ---------- */
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ws-server-alive");
});

/* ---------- WS ---------- */
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  // confirm connection
  ws.send(JSON.stringify({
    type: "system",
    text: "connected"
  }));

  // broadcast any message from anyone
  ws.on("message", (data) => {
    const text = data.toString();

    const payload = JSON.stringify({
      type: "message",
      text: text
    });

    for (const c of clients)
      if (c.readyState === 1)
        c.send(payload);
  });

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.on("error", () => {}); // prevents crash
});

/* ---------- START ---------- */
server.listen(PORT, "0.0.0.0", () => {
  console.log("running on", PORT);
});
