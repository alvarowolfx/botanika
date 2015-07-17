(function() {
    angular.module('botanika')
        .service('Research', Research);

    Research.$inject = ['Database', '$q', 'pouchDB'];

    function Research(Database, $q, pouchDB) {

        var service = {
            getAll: getAll,
            load: load,
            remove: remove,
            save: save
        }

        var db = Database.getDatabase();
        var researchDesignDoc = Database.createDesignDoc('research', function(doc) {
            if (doc.type === 'research') {
                emit(doc._id);
            }
        });
        db.put(researchDesignDoc);

        return service;

        function getAll() {
            return $q.when(db.query('research', {
                include_docs: true
            })).then(function(docs) {
                return docs.rows;
            });
        }

        function load(id) {
            return $q.when(db.get(id));
        }

        function remove(id) {
            return load(id).then(function(doc) {
                return db.remove(doc);
            });
        }

        function save(research) {
            if (research._id) {
                return $q.when(db.put(research));
            } else {
                research.type = 'research';
                return $q.when(db.post(research));
            }
        }

    };
})();
