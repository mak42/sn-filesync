class Server {

    /**
     * push some data to overwrite an instance record
     * @param snc {snc-client}
     * @param db {object} - the data to use in the post...
     * var db = {
                table: map.table,
                field: map.field,
                query: map.key + '=' + map.keyValue,
                sys_id: fileMeta.sys_id || false,
                payload: {},
            };
            // payload for a record update (many fields and values can be set)
            db.payload[db.field] = data;

     * @param callback {function}
     */
    static push(snc, db, callback) {
        snc.table(db.table).update(db, function (err, obj) {
            if (err) {
                handleError(err, db);
                callback(false);
                return;
            }

            callback(true);
        });
    };

}

module.exports = Server;
