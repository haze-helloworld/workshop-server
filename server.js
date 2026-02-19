wss.on("connection", (ws) => {
  clients.add(ws);

  // tell everyone someone joined
  broadcast({ type: "system", text: "user joined" });

  ws.on("message", (data) => {
    const text = data.toString();

    // send exactly what the user typed
    broadcast({
      type: "message",
      text: text
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcast({ type: "system", text: "user left" });
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const c of clients)
    if (c.readyState === 1) c.send(msg);
}
