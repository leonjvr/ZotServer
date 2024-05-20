### Zotero Plugin Development Documentation

To interact with the Zotero database, you'll typically use Zotero's built-in API functions. Here are some examples of how to fetch, create, update, and delete data within Zotero, which you can integrate into your endpoint handlers.

### Retrieving Data Examples

To retrieve data from the Zotero database, use Zotero's API functions such as `Zotero.Items.get()` for items or `Zotero.Collections.get()` for collections. Here's an example of how to fetch an item by its ID:

```javascript
Zotero.Server.Endpoints["/api/getItem"] = function() {
    this.init = function(request) {
        if (request.method === "GET") {
            let itemID = request.query.id;
            Zotero.Items.get(itemID).then(function(item) {
                if (item) {
                    request.sendResponse(200, "application/json", JSON.stringify(item));
                } else {
                    request.sendResponse(404, "text/plain", "Item not found");
                }
            }).catch(function(error) {
                Zotero.debug(error);
                request.sendResponse(500, "text/plain", "Internal Server Error");
            });
        } else {
            request.sendResponse(405, "text/plain", "Method Not Allowed");
        }
    };
};
```

### Creating Data

To create a new item, use the `Zotero.Items` constructor and save the item:

```javascript
Zotero.Server.Endpoints["/api/createItem"] = function() {
    this.init = function(request) {
        if (request.method === "POST") {
            let requestData = JSON.parse(request.data);
            let newItem = new Zotero.Item();
            newItem.itemType = requestData.itemType;
            newItem.title = requestData.title;
            // Set other fields as necessary
            newItem.save().then(function(savedItem) {
                request.sendResponse(201, "application/json", JSON.stringify(savedItem));
            }).catch(function(error) {
                Zotero.debug(error);
                request.sendResponse(500, "text/plain", "Internal Server Error");
            });
        } else {
            request.sendResponse(405, "text/plain", "Method Not Allowed");
        }
    };
};
```

### Updating Data

To update an existing item, fetch the item, modify its properties, and then save it:

```javascript
Zotero.Server.Endpoints["/api/updateItem"] = function() {
    this.init = function(request) {
        if (request.method === "POST") {
            let requestData = JSON.parse(request.data);
            Zotero.Items.get(requestData.id).then(function(item) {
                if (item) {
                    item.title = requestData.title;
                    // Update other fields as necessary
                    item.save().then(function(updatedItem) {
                        request.sendResponse(200, "application/json", JSON.stringify(updatedItem));
                    }).catch(function(error) {
                        Zotero.debug(error);
                        request.sendResponse(500, "text/plain", "Internal Server Error");
                    });
                } else {
                    request.sendResponse(404, "text/plain", "Item not found");
                }
            }).catch(function(error) {
                Zotero.debug(error);
                request.sendResponse(500, "text/plain", "Internal Server Error");
            });
        } else {
            request.sendResponse(405, "text/plain", "Method Not Allowed");
        }
    };
};
```

### Deleting Data

To delete an item, fetch it and then call its `erase()` method:

```javascript
Zotero.Server.Endpoints["/api/deleteItem"] = function() {
    this.init = function(request) {
        if (request.method === "POST") {
            let requestData = JSON.parse(request.data);
            Zotero.Items.get(requestData.id).then(function(item) {
                if (item) {
                    item.erase().then(function() {
                        request.sendResponse(204, "text/plain", "Item deleted");
                    }).catch(function(error) {
                        Zotero.debug(error);
                        request.sendResponse(500, "text/plain", "Internal Server Error");
                    });
                } else {
                    request.sendResponse(404, "text/plain", "Item not found");
                }
            }).catch(function(error) {
                Zotero.debug(error);
                request.sendResponse(500, "text/plain", "Internal Server Error");
            });
        } else {
            request.sendResponse(405, "text/plain", "Method Not Allowed");
        }
    };
};
```

### Example: Integrating Database Operations

Here's a more complete example integrating the above operations into a single endpoint for demonstration purposes:

```javascript
Zotero.Server.Endpoints["/api/item"] = function() {
    this.init = function(request) {
        switch (request.method) {
            case "GET":
                // Retrieve item by ID
                let itemID = request.query.id;
                Zotero.Items.get(itemID).then(function(item) {
                    if (item) {
                        request.sendResponse(200, "application/json", JSON.stringify(item));
                    } else {
                        request.sendResponse(404, "text/plain", "Item not found");
                    }
                }).catch(function(error) {
                    Zotero.debug(error);
                    request.sendResponse(500, "text/plain", "Internal Server Error");
                });
                break;
            case "POST":
                // Create or update item
                let requestData = JSON.parse(request.data);
                if (requestData.id) {
                    // Update item
                    Zotero.Items.get(requestData.id).then(function(item) {
                        if (item) {
                            item.title = requestData.title;
                            // Update other fields as necessary
                            item.save().then(function(updatedItem) {
                                request.sendResponse(200, "application/json", JSON.stringify(updatedItem));
                            }).catch(function(error) {
                                Zotero.debug(error);
                                request.sendResponse(500, "text/plain", "Internal Server Error");
                            });
                        } else {
                            request.sendResponse(404, "text/plain", "Item not found");
                        }
                    }).catch(function(error) {
                        Zotero.debug(error);
                        request.sendResponse(500, "text/plain", "Internal Server Error");
                    });
                } else {
                    // Create item
                    let newItem = new Zotero.Item();
                    newItem.itemType = requestData.itemType;
                    newItem.title = requestData.title;
                    // Set other fields as necessary
                    newItem.save().then(function(savedItem) {
                        request.sendResponse(201, "application/json", JSON.stringify(savedItem));
                    }).catch(function(error) {
                        Zotero.debug(error);
                        request.sendResponse(500, "text/plain", "Internal Server Error");
                    });
                }
                break;
            case "DELETE":
                // Delete item
                let deleteID = request.query.id;
                Zotero.Items.get(deleteID).then(function(item) {
                    if (item) {
                        item.erase().then(function() {
                            request.sendResponse(204, "text/plain", "Item deleted");
                        }).catch(function(error) {
                            Zotero.debug(error);
                            request.sendResponse(500, "text/plain", "Internal Server Error");
                        });
                    } else {
                        request.sendResponse(404, "text/plain", "Item not found");
                    }
                }).catch(function(error) {
                    Zotero.debug(error);
                    request.sendResponse(500, "text/plain", "Internal Server Error");
                });
                break;
            default:
                request.sendResponse(405, "text/plain", "Method Not Allowed");
        }
    };
};
```

This example demonstrates how to handle GET, POST, and DELETE methods within a single endpoint, retrieving, creating, updating, and deleting items in the Zotero database. For more complex interactions and advanced features, refer to Zotero's API documentation and existing codebase.