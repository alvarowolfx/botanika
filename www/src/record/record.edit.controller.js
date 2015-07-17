(function() {
    angular
        .module('botanika.research')
        .controller('RecordEditController', RecordEditController);

    RecordEditController.$inject = ['$state', '$ionicHistory', 'Record', '$cordovaGeolocation', '$cordovaCamera'];

    function RecordEditController($state, $ionicHistory, Record, $cordovaGeolocation, $cordovaCamera) {
        var vm = this;

        var researchId = $state.params.researchId;
        var id = $state.params.id;
        vm.isShowing = !!id;
        vm.cameraAvailable = !!navigator.camera;

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
            Record.load(id, true).then(function(record) {
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

        function getLocation() {
            $cordovaGeolocation.getCurrentPosition({
                enableHighAccuracy: true
            }).then(function(position) {
                vm.record.location.lat = position.coords.latitude;
                vm.record.location.lon = position.coords.longitude;
                vm.locationStatus = 'success';
            }, function(err) {
                //Handle geoloc error
                vm.locationStatus = 'error';
            });
        }

        function saveRecord() {
            var record = angular.copy(vm.record);
            record.researchId = researchId;
            Record.save(record).then(function() {
                $ionicHistory.goBack();
            }).catch(function(err) {
                //Handle error
                console.log(err);
            });
        }

        function getCommonCameraOption() {
            return {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: false
            }
        }

        function takePicture() {
            var options = getCommonCameraOption();
            options.sourceType = Camera.PictureSourceType.CAMERA;
            getPictureWithOptions(options);
        }

        function selectPicture() {
            var options = getCommonCameraOption();
            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            getPictureWithOptions(options);
        }

        function getPictureWithOptions(options) {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                vm.record.photo = imageData;
            }, function(err) {
                // error
            });
        }
    }
})();
