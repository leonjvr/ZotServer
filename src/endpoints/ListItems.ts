import EndpointInterface from '../types/EndpointInterface';

interface ZoteroItem {
    id: number;
    getField: (field: string) => string;
    itemType: string;
    dateAdded: string;
    dateModified: string;
    getAttachments: () => Promise<number[]>;
    isAttachment: () => boolean;
}

interface ZoteroAttachment {
    id: number;
    getField: (field: string) => string;
    attachmentType: string;
    attachmentPath: string;
    contentType: string;
    mimeType: string;
}

const possibleFields = ['attachmentPath', 'title', 'contentType', 'mimeType'];

export default class ListItems implements EndpointInterface {
    supportedMethods = ['GET'];
    supportedDataTypes = ['application/json'];
    permitBookmarklet = false;

    public async init(request: any): Promise<any[]> {
        const collectionID = request.query.collectionID;
        const withAttachments = request.query.withAttachments;

        if (!collectionID) {
            return [400, 'application/json', JSON.stringify({ error: 'collectionID is required' })];
        }

        const items = await this.getItemsInCollection(parseInt(collectionID), withAttachments);
        return [200, 'application/json', JSON.stringify(items)];
    }

    private async getItemsInCollection(collectionID: number, withAttachments: string): Promise<any[]> {
        const collection = await Zotero.Collections.get(collectionID);
        if (!collection) {
            throw new Error(`Collection with ID ${collectionID} not found`);
        }

        const s = new Zotero.Search();
        s.libraryID = collection.libraryID;
        s.addCondition('collectionID', 'is', collectionID);

        const itemIDs = await s.search();
        const items: ZoteroItem[] = await Zotero.Items.getAsync(itemIDs, { include: ['data'] });

        const itemsWithAttachments: any[] = [];

        for (const item of items) {
            if (item.isAttachment()) {
                continue; // Skip attachments when checking for parent items
            }

            const attachmentIDs = await item.getAttachments();
            const attachments: ZoteroAttachment[] = await Zotero.Items.getAsync(attachmentIDs, { include: ['data'] });

            const hasAttachments = attachments.length > 0;

            if (
                (withAttachments === '1' && hasAttachments) ||
                (withAttachments === '0' && !hasAttachments) ||
                withAttachments === undefined
            ) {
                itemsWithAttachments.push({
                    id: item.id,
                    title: item.getField('title'),
                    itemType: item.itemType,
                    dateAdded: item.dateAdded,
                    dateModified: item.dateModified,
                    doi: item.getField('DOI'),
                    attachments: attachments.map((attachment: ZoteroAttachment) => {
                        const attachmentPath = attachment.getField('attachmentPath') || attachment.getField('path');
                        const contentType = attachment.getField('attachmentContentType') || attachment.getField('mimeType');
                        return {
                            id: attachment.id,
                            path: attachmentPath,
                            attachmentType: contentType
                        };
                    })
                });
            }
        }

        return itemsWithAttachments;
    }
}
