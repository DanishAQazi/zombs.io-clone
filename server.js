// Simple WebSocket server for Zombs.io clone
const WebSocket = require("ws");
const http = require("http");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let players = {};

wss.on("connection", (ws) => {
  let id = Math.random().toString(36).substr(2, 9);
  players[id] = { x: 4000, y: 4000 };

  // send player their id
  ws.send(JSON.stringify({ type: "welcome", id, players }));

  ws.on("message", (msg) => {
    try {
      let data = JSON.parse(msg);
      if (data.type === "move") {
        players[id].x = data.x;
        players[id].y = data.y;
      }
      // broadcast all players
      broadcast({ type: "state", players });
    } catch (e) {
      console.error("Bad message", e);
    }
  });

  ws.on("close", () => {
    delete players[id];
    broadcast({ type: "state", players });
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
