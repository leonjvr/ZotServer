To determine if we can access the features of the `pdfWorker` module from a Zotero plugin or extension, let's break down its functionality and see how it interacts with Zotero components. Then, we can provide documentation on using these features if they are accessible.

### Overview of `pdfWorker` Functionality

The `pdfWorker` module handles various PDF-related tasks, including:

- Exporting annotations
- Importing annotations
- Processing Citavi and Mendeley annotations
- Deleting and rotating pages
- Extracting full text and recognizer data
- Rendering annotations

These tasks are handled by communicating with a web worker (`WORKER_URL`), which processes these requests asynchronously.

### Accessing `pdfWorker` Features

The `pdfWorker` module is initialized as `Zotero.PDFWorker`, and its methods can be accessed via this object. If your Zotero plugin or extension can call `Zotero.PDFWorker` and its methods, you can utilize its functionality. Given that it is defined as a property of the global `Zotero` object, you should be able to access it from a Zotero plugin.

### Using `pdfWorker` in Your Plugin

Below is the documentation to help you integrate `pdfWorker` functionalities into your Zotero plugin.

#### Importing Annotations

To import annotations from a PDF attachment:

```javascript
Zotero.PDFWorker.import(itemID, isPriority, password, transfer).then((result) => {
    console.log('Annotations imported:', result);
}).catch((error) => {
    console.error('Failed to import annotations:', error);
});
```

- **itemID**: The ID of the PDF attachment item.
- **isPriority**: Boolean to prioritize this task in the queue.
- **password**: Optional password for the PDF.
- **transfer**: Boolean to indicate if the operation involves transferring annotations.

#### Exporting Annotations

To export annotations to a specified path:

```javascript
Zotero.PDFWorker.export(itemID, path, isPriority, password, transfer).then((numAnnotations) => {
    console.log('Annotations exported:', numAnnotations);
}).catch((error) => {
    console.error('Failed to export annotations:', error);
});
```

- **itemID**: The ID of the PDF attachment item.
- **path**: The file path where the PDF with annotations will be saved.
- **isPriority**: Boolean to prioritize this task in the queue.
- **password**: Optional password for the PDF.
- **transfer**: Boolean to indicate if the operation involves transferring annotations.

#### Deleting Pages

To delete specific pages from a PDF attachment:

```javascript
Zotero.PDFWorker.deletePages(itemID, pageIndexes, isPriority, password).then(() => {
    console.log('Pages deleted successfully');
}).catch((error) => {
    console.error('Failed to delete pages:', error);
});
```

- **itemID**: The ID of the PDF attachment item.
- **pageIndexes**: An array of page indexes to delete.
- **isPriority**: Boolean to prioritize this task in the queue.
- **password**: Optional password for the PDF.

#### Rotating Pages

To rotate specific pages in a PDF attachment:

```javascript
Zotero.PDFWorker.rotatePages(itemID, pageIndexes, degrees, isPriority, password).then(() => {
    console.log('Pages rotated successfully');
}).catch((error) => {
    console.error('Failed to rotate pages:', error);
});
```

- **itemID**: The ID of the PDF attachment item.
- **pageIndexes**: An array of page indexes to rotate.
- **degrees**: The degree to rotate (90, 180, or 270).
- **isPriority**: Boolean to prioritize this task in the queue.
- **password**: Optional password for the PDF.

#### Extracting Full Text

To extract full text content from a PDF attachment:

```javascript
Zotero.PDFWorker.getFullText(itemID, maxPages, isPriority, password).then((fullText) => {
    console.log('Full text extracted:', fullText);
}).catch((error) => {
    console.error('Failed to extract full text:', error);
});
```

- **itemID**: The ID of the PDF attachment item.
- **maxPages**: Maximum number of pages to extract (null for all pages).
- **isPriority**: Boolean to prioritize this task in the queue.
- **password**: Optional password for the PDF.

#### Checking for Annotations

To check if a PDF attachment has any embedded annotations:

```javascript
Zotero.PDFWorker.hasAnnotations(itemID, isPriority, password).then((hasAnnotations) => {
    console.log('Has annotations:', hasAnnotations);
}).catch((error) => {
    console.error('Failed to check annotations:', error);
});
```

- **itemID**: The ID of the PDF attachment item.
- **isPriority**: Boolean to prioritize this task in the queue.
- **password**: Optional password for the PDF.

### Conclusion

The `pdfWorker` module provides powerful tools for handling PDF annotations and other related tasks within Zotero. By accessing `Zotero.PDFWorker` and its methods, you can integrate these features into your Zotero plugin, enhancing its capabilities. Ensure you handle promises and errors appropriately to maintain a robust implementation.