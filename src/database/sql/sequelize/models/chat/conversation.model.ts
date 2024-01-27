import { Column, CreatedAt, DataType, DeletedAt,
    IsUUID, Model, PrimaryKey, Table, UpdatedAt
} from 'sequelize-typescript';
import { v4 } from 'uuid';

///////////////////////////////////////////////////////////////////////

@Table({
    timestamps      : true,
    modelName       : 'Conversation',
    tableName       : 'chat_conversations',
    paranoid        : true,
    freezeTableName : true,
    })
export default class Conversation extends Model {

    @IsUUID(4)
    @PrimaryKey
    @Column({
        type         : DataType.UUID,
        defaultValue : () => {
            return v4();
        },
        allowNull : false,
    })
    id: string;

    @Column({
        type      : DataType.STRING(256),
        allowNull : true,
    })
    Topic: string;

    @Column({
        type         : DataType.BOOLEAN,
        allowNull    : false,
        defaultValue : false,
    })
    IsGroupConversation : boolean;

    @Column({
        type         : DataType.BOOLEAN,
        allowNull    : false,
        defaultValue : false,
    })
    Marked : boolean;

    @Column({
        type : DataType.UUID,

        allowNull : false,
    })
    InitiatingUserId: string;

    @Column({
        type : DataType.UUID,

        allowNull : false,
    })
    OtherUserId: string;

    @Column({
        type      : DataType.DATE,
        allowNull : true,
    })
    LastMessageTimestamp: Date;

    @Column
    @CreatedAt
    CreatedAt: Date;

    @UpdatedAt
    UpdatedAt: Date;

    @DeletedAt
    DeletedAt: Date;

}
