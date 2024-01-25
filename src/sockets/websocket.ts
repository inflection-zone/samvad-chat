
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ChatService } from '../services/chat.service';
import { Loader } from '../startup/loader';
import { ConversationDomainModel } from '../domain.types/chat/conversation.domain.model';
import { ConversationDto } from '../domain.types/chat/conversation.dto';
import { ChatMessageDomainModel } from "../domain.types/chat/chat.message.domain.model";
import { ChatMessageDto } from "../domain.types/chat/chat.message.dto";

//////////////////////////////////////////////////////////////////////////////

export class Websocket {

    static _io: Server = null;

    static _adapterInitialized = false;

    static _redisPubClient = null;

    static _redisSubClient = null;

    public static initialize(io: Server): void {
        this._io = io;
        const adapterType = process.env.SOCKET_IO_ADAPTER;
        if (! this._adapterInitialized) {
            if (adapterType === 'redis') {
                const redisURL = process.env.REDIS_HOST; // Use default if not provided
                this._redisPubClient = createClient({ url: redisURL });
                this._redisSubClient = this._redisPubClient.duplicate();
                this._io.adapter(createAdapter(this._redisPubClient, this._redisSubClient));
            }
            else {
                this._io.adapter(null);
            }
            this._adapterInitialized = true;
        }

        Websocket._redisPubClient.on('error', (error) => {
            console.error('Redis pub client error:', error);
            console.log('Switching to in-memory adapter.');
            // Websocket.initialize(Websocket._io);
            Websocket._io.adapter(null); // Use the default in-memory adapter
        });

        Websocket._redisSubClient.on('error', (error) => {
            console.error('Redis sub client error:', error);
            console.log('Switching to in-memory adapter.');
            // Websocket.initialize(Websocket._io);
            Websocket._io.adapter(null); // Use the default in-memory adapter
        });

        Websocket._io.on('connection', (socket) => {

            console.log('user Joined the chat'); // Log when a user connects

            // Event listener for when a user joins the chat
            socket.on('user join', (username) => {
            // Emit a message to all clients indicating a user has joined the chat
                io.emit('user joined', `${username} joined the chat`);

                //Create a room for the conversation



            });

            // Event listener for handling chat messages
            socket.on('chat message', (message) => {
                // Emit the received chat message to all connected clients

                io.emit('chat message', message);

                //TODO: Save the message to the database through the service

                //1. Get chat service
                const chatService = Loader.container.resolve(ChatService);

                //3. Convert the message to a domain model
                // const messageModel: ChatMessageDomainModel = {
                //     ConversationId : message.room,
                //     Message        : message.message,
                //     SenderId       : message.username,
                // };

                // //2. Save the message
                // const messageRecord = await chatService.sendMessage(message);

            });

            // Event listener for handling disconnection of a user
            socket.on('disconnect', () => {
                console.log('user left'); // Log when a user disconnects
            });

        });

    }

}