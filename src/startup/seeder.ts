import fs from "fs";
import path from "path";
import { inject, injectable } from "tsyringe";
import { Helper } from "../common/helper";
import { Logger } from "../common/logger";
import { IApiClientRepo } from "../database/repository.interfaces/api.client/api.client.repo.interface";
import { ApiClientDomainModel } from "../domain.types/api.client/api.client.domain.model";
import { ApiClientService } from "../services/api.client.service";
import { FileResourceService } from "../services/file.resource.service";
import { Loader } from "./loader";

//////////////////////////////////////////////////////////////////////////////

@injectable()
export class Seeder {

    _apiClientService: ApiClientService = null;

    _fileResourceService: FileResourceService = null;

    constructor(
        @inject('IApiClientRepo') private _apiClientRepo: IApiClientRepo,
    ) {
        this._apiClientService = Loader.container.resolve(ApiClientService);
        this._fileResourceService = Loader.container.resolve(FileResourceService);
    }

    public init = async (): Promise<void> => {
        try {
            await this.createTempFolders();
            await this.seedInternalClients();

        } catch (error) {
            Logger.instance().log(error.message);
        }
    };

    private createTempFolders = async () => {
        await Helper.createTempDownloadFolder();
        await Helper.createTempUploadFolder();
    };

    private loadJSONSeedFile(file: string): any {
        var filepath = path.join(process.cwd(), 'seed.data', file);
        var fileBuffer = fs.readFileSync(filepath, 'utf8');
        const obj = JSON.parse(fileBuffer);
        return obj;
    }

    private seedInternalClients = async () => {

        Logger.instance().log('Seeding internal clients...');

        const arr = this.loadJSONSeedFile('internal.clients.seed.json');

        for (let i = 0; i < arr.length; i++) {
            var c = arr[i];
            let client = await this._apiClientService.getByClientCode(c.ClientCode);
            if (client == null) {
                const model: ApiClientDomainModel = {
                    ClientName   : c['ClientName'],
                    ClientCode   : c['ClientCode'],
                    IsPrivileged : c['IsPrivileged'],
                    Email        : c['Email'],
                    Password     : c['Password'],
                    ValidFrom    : new Date(),
                    ValidTill    : new Date(2030, 12, 31),
                    ApiKey       : c['ApiKey'],
                };
                client = await this._apiClientService.create(model);
                var str = JSON.stringify(client, null, '  ');
                Logger.instance().log(str);
            }
        }

    };

    // getImageResourceIdForSymptomType = async (fileName) => {
    //     if (fileName === null) {
    //         return null;
    //     }
    //     var storagePath = 'assets/images/symptom.images/' + fileName;
    //     var sourceFileLocation = path.join(process.cwd(), "./assets/images/symptom.images/", fileName);

    //     var uploaded = await this._fileResourceService.uploadLocal(
    //         sourceFileLocation,
    //         storagePath,
    //         true);

    //     return uploaded.id;
    // };

    // getImageResourceIdForNutritionQuestion = async (fileName) => {
    //     if (fileName === null) {
    //         return null;
    //     }
    //     var storagePath = 'assets/images/nutrition.images/' + fileName;
    //     var sourceFileLocation = path.join(process.cwd(), "./assets/images/nutrition.images/", fileName);

    //     var uploaded = await this._fileResourceService.uploadLocal(
    //         sourceFileLocation,
    //         storagePath,
    //         true);

    //     return uploaded.id;
    // };

}
