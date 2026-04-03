import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server) : void {
    io.on('connection', (socket: Socket)=> {
        console.log(`🔌 Socket connected: ${socket.id}`)
    })
}