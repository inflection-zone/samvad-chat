import { ConversationDomainModel } from '../domain.types/chat/conversation.domain.model';
import { ConversationDto } from '../domain.types/chat/conversation.dto';
import { ChatMessageDomainModel } from "../domain.types/chat/chat.message.domain.model";
import { ChatMessageDto } from "../domain.types/chat/chat.message.dto";
import { Loader } from '../startup/loader';
import { ChatService } from '../services/chat.service';
import * as asyncLib from 'async';

const ASYNC_TASK_COUNT = 4;
//////////////////////////////////////////////////////////////////////////////

export class MessageQueue {

    // private static _messageQueue: PQueue = new PQueue();

    private static _messageQueue = asyncLib.queue((messageModel: ChatMessageDomainModel, onCompleted) => {
        (async () => {
            await MessageQueue._messageQueue.add(async () => {
                console.log(`Message enqueued: ${JSON.stringify(messageModel, null, 2)}`);
                const chatService = Loader.container.resolve(ChatService);
                const messageRecord: ChatMessageDto = await chatService.sendMessage(messageModel);
                console.log(`Message sent: ${JSON.stringify(messageRecord, null, 2)}`);
            });
            onCompleted(messageModel);
        })();
    }, ASYNC_TASK_COUNT);

    private static _conversationQueue = asyncLib.queue((conversationModel: ConversationDomainModel, onCompleted) => {
        (async () => {
            await MessageQueue._conversationQueue.add(async () => {
                console.log(`Conversation enqueued: ${JSON.stringify(conversationModel, null, 2)}`);
                const conversionId = conversationModel.id;
                const chatService = Loader.container.resolve(ChatService);
                if (conversionId) {
                    const conversationRecord: ConversationDto = await chatService.getConversationById(conversionId);
                    if (conversationRecord) {
                        console.log(`Conversation already exists: ${JSON.stringify(conversationRecord, null, 2)}`);
                        return;
                    }
                }
                const conversationRecord: ConversationDto = await chatService.startConversation(conversationModel);
                console.log(`Conversation started: ${JSON.stringify(conversationRecord, null, 2)}`);
            });
            onCompleted(conversationModel);
        })();
    }, ASYNC_TASK_COUNT);

    private static enqueue = (q: any, model: ChatMessageDomainModel | ConversationDomainModel) => {
        q.push(model, (model, error) => {
            if (error) {
                console.log(`Error queueing task: ${JSON.stringify(error)}`);
                console.log(`Error queueing task: ${JSON.stringify(error.stack, null, 2)}`);
            }
            else {
                console.log(`Queued task: ${JSON.stringify(model, null, 2)}`);
            }
        });
    };

    public static storeMessage(model: ChatMessageDomainModel) {
        try {
            MessageQueue._messageQueue.push(model);
        }
        catch (error) {
            console.log(`${JSON.stringify(error.message, null, 2)}`);
        }
    }

    public static startOrUpdateConversation(model: ConversationDomainModel) {
        try {
            MessageQueue._conversationQueue.push(model);
        }
        catch (error) {
            console.log(`${JSON.stringify(error.message, null, 2)}`);
        }
    }

}
