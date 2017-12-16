var dbPromise = idb.open("post-store", 1, function(db) {
    if(!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", {keyPath: "id"});
    }
});

function writeData(store, data) {
    dbPromise
        .then(function(db) {
            var tx = db.transaction(store, "readwrite");
            var store = tx.objectStore(store);
            store.put(data);
            return tx.complete;
        });
}