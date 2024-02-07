import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server();

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handling "join" message to subscribe to a UUID
    socket.on('join', (data) => {
      try {
        const { uuid } = JSON.parse(data); // Assuming data is a JSON string
        socket.join(uuid);
        console.log(`User ${socket.id} joined room: ${uuid}`);

        // Check the room size after joining
        const roomSize = io.sockets.adapter.rooms.get(uuid)?.size || 0;
        console.log(`Room ${uuid} size: ${roomSize}`);

        // If two users are in the room, start the fight
        if (roomSize === 2) {
          io.to(uuid).emit('message', JSON.stringify({ event: 'fight/begin' }));
          console.log(`Fight started in room: ${uuid}`);
        }
      } catch (error) {
        console.log(`Error parsing join data from ${socket.id}:`, error);
      }
    });

    // Handling messages. Assuming messages include the UUID.
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data); // Assuming data is a JSON string
        const { uuid } = message;
        if (uuid) {
          console.log(`Message received for room ${uuid} from ${socket.id}: ${data}`);
          // Emitting message to all clients in the room (UUID)
          io.to(uuid).emit('message', data);
        }
      } catch (error) {
        console.log(`Error parsing message data from ${socket.id}:`, error);
      }
    });

    // Log when a user disconnects
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  io.listen(3000);
  console.log("Listening on port 3000");
});
