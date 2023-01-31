import express from 'express';
import { ChatUserController } from './chat.user.controller';
import { Loader } from '../../startup/loader';

export const register = (app: express.Application): void => {

    const router = express.Router();
    //const authenticator = Loader.authenticator;
    const controller = new ChatUserController();

    router.post('/', controller.create);
    // router.get('/search', controller.search);
    router.get('/allusers', controller.getAllUsers);
    router.get('/:id', controller.getById);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.delete);
    // router.put('/:clientCode/renew-api-key', controller.renewApiKey);

    app.use('/api/v1/chat-users', router);
};

