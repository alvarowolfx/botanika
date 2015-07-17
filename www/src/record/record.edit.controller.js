(function() {
    angular
        .module('botanika.research')
        .controller('RecordEditController', RecordEditController);

    RecordEditController.$inject = ['$state', '$ionicHistory', 'Record', '$cordovaGeolocation'];

    function RecordEditController($state, $ionicHistory, Record, $cordovaGeolocation) {
        var vm = this;

        var researchId = $state.params.researchId;
        var id = $state.params.id;
        vm.isShowing = !!id;

        vm.saveRecord = saveRecord;
        vm.selectPicture = selectPicture;
        vm.takePicture = takePicture;

        if (vm.isShowing) {
            loadRecord(id);
        } else {
            resetRecord();
            getLocation();
        }

        function loadRecord(id) {
            Record.load(id).then(function(record) {
                vm.record = record;
            });
        }

        function resetRecord() {
            vm.record = {
                measures: [],
                observation: "",
                photo: null,
                location: {
                    lat: null,
                    lon: null
                }
            }
            vm.locationStatus = null;
        }

        function getLocation(){
            $cordovaGeolocation.getCurrentPosition({
                enableHighAccuracy: true
            }).then(function(position){
                vm.record.location.lat = position.coords.latitude;
                vm.record.location.lon = position.coords.longitude;
                vm.locationStatus = 'success';
            }, function(err){
                //Handle geoloc error
                vm.locationStatus = 'error';
            });
        }

        function saveRecord() {
            $ionicHistory.goBack();
        }

        function takePicture(){

        }

        function selectPicture(){

        }
    }
})();
