import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to the server");

    const joinMsg = {uuid: 1234};
    
    socket.emit("join", JSON.stringify(joinMsg));
});

socket.on("message", (data) => {
    console.log(data);
});
