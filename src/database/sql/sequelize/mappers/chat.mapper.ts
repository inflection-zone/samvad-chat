import { uuid } from '../../../../domain.types/miscellaneous/system.types';
import { ConversationDto } from '../../../../domain.types/chat/conversation.dto';
import Conversation from '../models/chat/conversation.model';

///////////////////////////////////////////////////////////////////////////////////

export class ChatMapper {

    static toDto = (conversation: Conversation, users?: uuid[]): ConversationDto => {
        if (conversation == null){
            return null;
        }

        const dto: ConversationDto = {
            id                   : conversation.id,
            IsGroupConversation  : conversation.IsGroupConversation,
            Marked               : conversation.Marked,
            InitiatingUserId     : conversation.InitiatingUserId,
            OtherUserId          : conversation.OtherUserId,
            Topic                : conversation.Topic,
            Users                : users ?? null,
            LastMessageTimestamp : conversation.LastMessageTimestamp,
        };
        return dto;
    };

}
