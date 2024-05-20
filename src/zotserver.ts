import Search from './endpoints/Search';
import ListCollections from './endpoints/ListCollections';
import ListItems from './endpoints/ListItems';
import UploadFile from './endpoints/UploadFile';

export default class ZotServer {

    public start() {
        Zotero.Server.Endpoints['/zotserver/search'] = Search;
        Zotero.Server.Endpoints['/zotserver/listCollections'] = ListCollections;
        Zotero.Server.Endpoints['/zotserver/listItems'] = ListItems;
        Zotero.Server.Endpoints['/zotserver/uploadFile'] = UploadFile;

        Zotero.debug('Endpoints registered:', Zotero.Server.Endpoints);
    }

}