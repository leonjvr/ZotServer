import EndpointInterface from '../types/EndpointInterface';

export default class ListCollections implements EndpointInterface {
    supportedMethods = ['GET'];
    supportedDataTypes = ['application/json'];
    permitBookmarklet = false;

    public async init(request: any) {
        const collections = await Zotero.Collections.getAll();
        return [200, 'application/json', JSON.stringify(collections)];
    }
}
