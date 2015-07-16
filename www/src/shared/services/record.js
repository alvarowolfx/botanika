(function() {
    angular.module('botanika')
        .service('Record', Record);

    Record.$inject = ['Database', '$q', 'pouchDB'];

    function Record(Database, $q, pouchDB) {

        var service = {
            allByResearch: allByResearch,
            save: save
        }

        var db = Database.getDatabase();
        Database.registerModel('record');

        return service;

        function allByResearch() {
            return $q.when([]);
        }

        function save(record) {
            research.type = 'record';
            return $q.when(db.post(record));
        }

    };
})();
