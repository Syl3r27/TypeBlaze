import { Server, Socket } from 'socket.io';
import { createRoom, getRoomById, getRoomBySocketId, joinRoom, leaveRoom, startCountDown, startRace, updatePlayerProgress } from './roomManager';

export function setupSocketHandlers(io: Server) : void {
    io.on('connection', (socket: Socket)=> {
        console.log(`🔌 Socket connected: ${socket.id}`)

        // Create A New Room

        socket.on('room:create',({username} : {username:string})=>{
            const room = createRoom(socket.id, username || 'Anonymous');
            socket.join(room.id);
            socket.emit('room:created',{ room });
            console.log(`🏠 Room created: ${room.code} by ${username}`);
        });

        // Join Existing Room
        socket.on('room:join',({code, username}: {code:string, username:string})=>{
            const {room, error} = joinRoom(code, socket.id, username ||'Anonymous');

            if(error || !room){
                socket.emit('room:error', {message: error || 'Failed to join room'});
                return;
            }

            socket.join(room.id);
            socket.emit('room:joined', {room});
            socket.to(room.id).emit('room:player_joined', {
                player: room.players[room.players.length - 1],
                room,
            });
            
            console.log(`👤 ${username} joined room ${room.code}`)
        });

        // Host Start the CountDown
        socket.on('room:start',()=>{
            const room = getRoomBySocketId(socket.id);
            if(!room) return;

            if(room.hostId !== socket.id){
                socket.emit('room:error', { message:'Only host can start the game' })
                return;
            }
            if(room.players.length<1){
                socket.emit('room:error',{message:'Need at least 1 player to start'})
                return;
            }

            const updatedRoom = startCountDown(room.id);
            if(!updatedRoom) return;

            io.to(room.id).emit('room:countdown', { room: updatedRoom});
            
            // Countdown: 3,2,1 GO!

            let count = 3;
            const countdownInterval = setInterval(()=>{
                io.to(room.id).emit('room:countdown_tick', {count});
                count--;

                if(count<0){
                    clearInterval(countdownInterval);
                    const racingRoom = startRace(room.id);
                    if(racingRoom){
                        io.to(room.id).emit('room:race_start', {room: racingRoom});
                    }
                }
            }, 1000)
        });

        // Player Progress Update (throttled on client side)
        socket.on(
            'player:progress',
            ({
                progress,
                wpm,
                accuracy
            }:{
                progress:number;
                wpm: number;
                accuracy: number;
            }) =>{
                const room = updatePlayerProgress(socket.id, progress,wpm,accuracy);
                if(!room) return;

                // Broadcast to all players in a rom

                socket.to(room.id).emit('room:progress_update',{
                    players:room.players,
                })

                // If someone finished

                const justFinished = room.players.find(
                    (p)=> p.socketId === socket.id && p.finished
                );
                if(justFinished){
                    io.to(room.id).emit('player:finished',{
                        player: justFinished,
                        players: room.players,
                    });
                }
            }
        );

        // Request current room state
        socket.on('room:get_state',()=>{
            const room = getRoomBySocketId(socket.id);
            if(room){
                socket.emit('room:state', { room })
            }
        });

        // Leave Room
        socket.on('room:leave',()=>{
            handleDisconnect(socket, io)
        });

        // Disconnect
        socket.on('disconnect',()=>{
            handleDisconnect(socket, io);
            console.log(`Socket Disconnected: ${socket.id}`);
        })

        // Chat message within room
        socket.on('room:chat',({message}:{message:string})=>{
            const room = getRoomBySocketId(socket.id);
            if(!room) return

            const player = room.players.find((p)=>p.socketId === socket.id);
            if(!player) return;
            
            io.to(room.id).emit('room:chat_message',{
                username: player.username,
                message: message.substring(0, 100),
                timestamp: Date.now(),
            });
        });
    });
}

function handleDisconnect(socket: Socket, io:Server) : void {
    const {room, wasHost} = leaveRoom(socket.id);

    if(!room) return;

    socket.leave(room.id);

    const roomStillExists = getRoomById(room.id);

    if(roomStillExists){
        io.to(room.id).emit('room:player_left', {
            socketId : socket.id,
            room: roomStillExists,
            newHostId: wasHost ? room.players[0]?.socketId : undefined,
        });
    } else{
        io.to(room.id).emit('room:closed', {message: 'Room has been closed'})
    }
}

