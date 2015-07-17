(function() {
    angular.module('botanika')
        .service('Database', Database);

    Database.$inject = ['$q', 'pouchDB'];

    function Database($q, pouchDB) {

        var service = {
            getDatabase: getDatabase,
            createDesignDoc: createDesignDoc
        }

        var db = pouchDB('botanika', {
            adapter: 'websql'
        });

        function getDatabase() {
            return db;
        }

        function createDesignDoc(name, mapFunction) {
            var ddoc = {
                _id: '_design/' + name,
                views: {

                }
            };
            ddoc.views[name] = {
                map: mapFunction.toString()
            };
            return ddoc;
        }

        return service;

    };
})();
