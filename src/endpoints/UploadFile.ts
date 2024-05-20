import EndpointInterface from '../types/EndpointInterface';
import { IncomingMessage } from 'http';
import busboy from 'busboy';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface ZoteroItem {
  id: number;
  getField: (field: string) => string;
  itemType: string;
  dateAdded: string;
  dateModified: string;
  getAttachments: () => Promise<number[]>;
  isAttachment: () => boolean;
}

export default class UploadFile implements EndpointInterface {
  supportedMethods = ['POST'];
  supportedDataTypes = ['application/json', 'multipart/form-data'];
  permitBookmarklet = false;

  public async init(request: IncomingMessage): Promise<any[]> {
    Zotero.debug('UploadFile endpoint hit');
    const contentTypeHeader = request.headers['content-type'];
    Zotero.debug('Request headers: ' + JSON.stringify(request.headers));

    if (!contentTypeHeader || !contentTypeHeader.includes('multipart/form-data')) {
      return [400, 'application/json', JSON.stringify({ error: 'Content-Type header is missing or invalid' })];
    }

    const bb = busboy({ headers: request.headers });
    let itemID: string | undefined;
    let file: { filename: string; data: Buffer; contentType: string } | undefined;

    return new Promise((resolve, reject) => {
      bb.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
        if (fieldname === 'file') {
          const buffers: Buffer[] = [];
          fileStream.on('data', (data: Buffer) => {
            buffers.push(data);
          }).on('end', () => {
            file = {
              filename,
              data: Buffer.concat(buffers),
              contentType: mimetype,
            };
          });
        }
      });

      bb.on('field', (fieldname, value) => {
        if (fieldname === 'itemID') {
          itemID = value.replace(/"/g, ''); // Remove quotes if present
        }
      });

      bb.on('finish', async () => {
        if (!itemID || !file) {
          resolve([400, 'application/json', JSON.stringify({ error: 'itemID and file are required' })]);
          return;
        }

        const numericItemID = parseInt(itemID, 10);
        if (isNaN(numericItemID)) {
          resolve([400, 'application/json', JSON.stringify({ error: 'itemID must be a number' })]);
          return;
        }

        try {
          const filePath = await this.saveFile(file);
          const item = await this.attachFileToItem(numericItemID, filePath);
          resolve([200, 'application/json', JSON.stringify(item)]);
        } catch (error) {
          resolve([500, 'application/json', JSON.stringify({ error: error.message })]);
        }
      });

      request.pipe(bb);
    });
  }

  private async saveFile(file: { filename: string; data: Buffer; contentType: string }): Promise<string> {
    const filename = `${uuidv4()}-${file.filename}`;
    const filePath = path.join('uploads', filename);

    // Save the file to the specified filePath using Zotero's file API
    await Zotero.File.putContentsAsync(filePath, file.data);

    return filePath;
  }

  private async attachFileToItem(itemID: number, filePath: string): Promise<ZoteroItem> {
    const parentItem = await Zotero.Items.getAsync(itemID);
    if (!parentItem) {
      throw new Error(`Item with ID ${itemID} not found`);
    }

    // Create a new attachment item and link it to the file
    const attachmentItem = await Zotero.Attachments.linkFromFile({
      file: filePath,
      parentItemID: itemID,
    });

    // Set attachment metadata
    attachmentItem.attachmentLinkMode = Zotero.Attachments.LINK_MODE_LINKED_FILE;
    attachmentItem.attachmentFilename = Zotero.File.basename(filePath);
    attachmentItem.attachmentContentType = 'application/octet-stream'; // Set the appropriate content type
    attachmentItem.attachmentCharset = null;
    attachmentItem.attachmentPath = filePath;

    await attachmentItem.saveTx();

    return parentItem;
  }
}
