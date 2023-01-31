import { ChatUserDomainModel } from '../../domain.types/chat.user/chat.user.domain.model';
import { ChatUserDto } from '../../domain.types/chat.user/chat.user.dto';

////////////////////////////////////////////////////////////////////////////////////////////////

export interface IChatUserRepo {

    create(UserDomainModel: ChatUserDomainModel): Promise<ChatUserDto>;

    getById(id: string): Promise<ChatUserDto>;

    // getByClientCode(clientCode: string): Promise<ApiClientDto>;

    // getClientHashedPassword(id: string): Promise<string>;

    // getApiKey(id: string): Promise<ClientApiKeyDto>;

    // setApiKey(id: string, apiKey: string, validFrom: Date, validTill: Date): Promise<ClientApiKeyDto>;

    // isApiKeyValid(apiKey: string): Promise<CurrentClient>;

    update(id: string, userDomainModel: ChatUserDomainModel): Promise<ChatUserDto>;

    // search(filters: ApiClientSearchFilters): Promise<ApiClientSearchResults>;

    delete(id: string): Promise<boolean>;
    getAllUsers(): Promise<ChatUserDto[]>

}
