(function() {
    angular.module('botanika')
        .service('Database', Database);

    Database.$inject = ['$q', 'pouchDB'];

    function Database($q, pouchDB) {

        var service = {
            getDatabase: getDatabase,
            createDesignDoc: createDesignDoc,
            registerModel: registerModel
        }

        var db = pouchDB('botanika');

        function getDatabase(){
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

        function registerModel(modelName){
            var modelDesignDoc = createDesignDoc(modelName,function(doc){
                if(doc.type === modelName){
                    emit(doc._id);
                }
            });
            db.put(modelDesignDoc);
        }

        return service;

    };
})();
