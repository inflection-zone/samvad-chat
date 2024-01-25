import PQueue from 'p-queue';
import { ConversationDomainModel } from '../domain.types/chat/conversation.domain.model';
import { ConversationDto } from '../domain.types/chat/conversation.dto';
import { ChatMessageDomainModel } from "../domain.types/chat/chat.message.domain.model";
import { ChatMessageDto } from "../domain.types/chat/chat.message.dto";
import { Loader } from '../startup/loader';
import { ChatService } from '../services/chat.service';

//////////////////////////////////////////////////////////////////////////////

export class MessageQueue {

    private static _messageQueue: PQueue = new PQueue();

    private static _conversationQueue: PQueue = new PQueue();

    public static enqueueMessage(messageModel: ChatMessageDomainModel) {
        (async () => {
            await MessageQueue._messageQueue.add(async () => {
                console.log(`Message enqueued: ${JSON.stringify(messageModel, null, 2)}`);
                const chatService = Loader.container.resolve(ChatService);
                const messageRecord: ChatMessageDto = await chatService.sendMessage(messageModel);
                console.log(`Message sent: ${JSON.stringify(messageRecord, null, 2)}`);
            });
        })();
    }

    public static enqueueConversation(conversationModel: ConversationDomainModel) {
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
        })();
    }

    public static storeMessage(model: ChatMessageDomainModel) {
        MessageQueue.enqueueMessage(model);
    }

    public static startOrUpdateConversation(model: ConversationDomainModel) {
        MessageQueue.enqueueConversation(model);
    }

}
