(function() {
    angular
        .module('botanika.research')
        .controller('RecordEditController', RecordEditController);

    RecordEditController.$inject = ['$state', '$ionicHistory', 'Record'];

    function RecordEditController($state, $ionicHistory, Record) {
        var vm = this;

        var researchId = $state.params.researchId;
        var id = $state.params.id;
        vm.isShowing = !!id;

        vm.saveRecord = saveRecord;

        if (vm.isShowing) {
            loadRecord(id);
        } else {
            resetRecord();
        }

        function loadRecord(id) {
            Record.load(id).then(function(record) {
                vm.record = record;
            });
        }

        function resetRecord() {
            vm.research = {
                measures: [],
                observation: "",
                photo: null,
                location: {
                    lat: null,
                    lon: null
                }
            }
        }


        function saveRecord() {
            $ionicHistory.goBack();
        }
    }
})();
