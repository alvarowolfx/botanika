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
        var recordDesignDoc = Database.createDesignDoc('record', function(doc) {
            if (doc.type === 'record') {
                emit(doc._id);
            }
        });
        db.put(recordDesignDoc);
        var recordByResearchDesignDoc = Database.createDesignDoc('record_by_research', function(doc) {
            if (doc.type === 'record') {
                emit(doc.researchId, doc.createdAt);
            }
        });
        db.put(recordByResearchDesignDoc);

        return service;

        function allByResearch(researchId) {
            return $q.when(db.query('record_by_research', {
                startkey: researchId,
                endkey: researchId,
                descending: true,
                include_docs: true
            })).then(function(docs) {
                return docs.rows;
            });
        }

        function load(id){
            return $q.when(db.get(id));
        }

        function save(record) {
            if(record._id){
                return $q.reject('Record cannot be updated');
            }

            if(!record.researchId){
                return $q.reject('Research id is required');
            }
            if (record.photo) {
                record._attachments = {
                    photo: {
                        content_type: 'image/png',
                        data: record.photo
                    }
                }
            }
            record.type = 'record';
            record.createdAt = new Date();
            return $q.when(db.post(record));
        }

    };
})();
