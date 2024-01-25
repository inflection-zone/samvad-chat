import cors from 'cors';
import http from 'http';
import "reflect-metadata";
import express from 'express';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { Router } from './api/router';
import { Logger } from './common/logger';
import { ConfigurationManager } from "./config/configuration.manager";
import { Loader } from './startup/loader';
import { Websocket } from './sockets/websocket';

/////////////////////////////////////////////////////////////////////////

export default class Application {

    public _app: express.Application = null;

    private _router: Router = null;

    private _server: http.Server = null;

    private _io: Server = null;

    private static _instance: Application = null;

    private constructor() {
        this._app = express();
        this._router = new Router(this._app);
        this._server = http.createServer(this._app);
        this._io = new Server(this._server, {
            cors : {
                origin : '*'
            }
        });
        Websocket.initialize(this._io);
    }

    public static instance(): Application {
        return this._instance || (this._instance = new this());
    }

    public app(): express.Application {
        return this._app;
    }

    public start = async(): Promise<void> => {
        try {

            //Load configurations
            ConfigurationManager.loadConfigurations();

            //Load the modules
            await Loader.init();

            if (process.env.NODE_ENV === 'test') {
                await Loader.databaseConnector.dropDatabase();
            }

            //Connect with database
            await Loader.databaseConnector.init();

            //Set-up middlewares
            await this.setupMiddlewares();

            //Set the routes
            await this._router.init();

            //Seed the service
            await Loader.seeder.init();

            //Set-up cron jobs
            await Loader.scheduler.schedule();

            process.on('exit', code => {
                Logger.instance().log(`Process exited with code: ${code}`);
            });

            //Start listening
            await this.listen();

        }
        catch (error){
            Logger.instance().log('An error occurred while starting reancare-api service.' + error.message);
        }
    };

    private setupMiddlewares = async (): Promise<boolean> => {

        return new Promise((resolve, reject) => {
            try {
                this._app.use(express.urlencoded({ extended: true }));
                this._app.use(express.json());
                this._app.use(helmet());
                this._app.use(cors());
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
    };

    private listen = () => {
        return new Promise((resolve, reject) => {
            try {
                const port = process.env.PORT;
                const server = this._app.listen(port, () => {
                    const serviceName = 'Samvad Chat api' + '-' + process.env.NODE_ENV;
                    Logger.instance().log(serviceName + ' is up and listening on port ' + process.env.PORT.toString());
                    this._app.emit("server_started");
                });
                module.exports.server = server;
                resolve(this._app);
            }
            catch (error) {
                reject(error);
            }
        });
    };

}
