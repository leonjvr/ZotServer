import EndpointInterface from '../types/EndpointInterface';

export default class ListCollections implements EndpointInterface {
    supportedMethods = ['GET'];
    supportedDataTypes = ['application/json'];
    permitBookmarklet = false;

    public async init(request: any): Promise<any[]> {
        const collections = await this.getAllCollections();
        return [200, 'application/json', JSON.stringify(collections)];
    }

    private async getAllCollections(): Promise<any[]> {
        const collections: any[] = [];
        const userLibraryID = Zotero.Libraries.userLibraryID;
        const groupLibraries = Zotero.Libraries.getAll().filter(lib => lib.libraryType === 'group');

        // Get collections from the user's library
        collections.push(...await this.getCollections(userLibraryID));

        // Get collections from each shared group library
        for (const group of groupLibraries) {
            collections.push(...await this.getCollections(group.libraryID));
        }

        return collections;
    }

    private async getCollections(libraryID: number): Promise<any[]> {
        const collections: any[] = [];
        const topLevelCollections = await Zotero.Collections.getByLibrary(libraryID);

        for (const collection of topLevelCollections) {
            collections.push(await this.getCollectionData(collection));
        }

        return collections;
    }

    private async getCollectionData(collection: any): Promise<any> {
        const collectionData: any = {
            id: collection.id,
            name: collection.name,
            parentID: collection.parentID,
            libraryID: collection.libraryID,
            childCollections: [] as any[]
        };

        const childCollections = await collection.getChildCollections();
        for (const child of childCollections) {
            collectionData.childCollections.push(await this.getCollectionData(child));
        }

        return collectionData;
    }
}
