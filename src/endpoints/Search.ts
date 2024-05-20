import EndpointInterface from '../types/EndpointInterface';

export default class Search implements EndpointInterface {
    supportedMethods = ['POST'];
    supportedDataTypes = ['application/json'];
    permitBookmarklet = false;

    public async init(request: any) {
        const searchResults = await this.search(request.data);
        const items = await Zotero.Items.getAsync(searchResults);
        return [200, 'application/json', JSON.stringify(items)];
    }

    private search(conditions: any[]) {
        const s = new Zotero.Search();
        s.libraryID = Zotero.Libraries.userLibraryID;

        conditions.forEach(({ condition, operator = 'contains', value, required = true }) => {
            s.addCondition(condition, operator, value, required);
        });

        return s.search();
    }
}
