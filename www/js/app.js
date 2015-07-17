(function() {
    angular.module('botanika', ['ionic',
        'botanika.research',
        'botanika.config',
        'pouchdb',
        'ngCordova'
    ]);
})();

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

(function() {
    angular.module('botanika')
        .service('Record', Record);

    Record.$inject = ['Database', '$q', 'pouchDB'];

    function Record(Database, $q, pouchDB) {

        var service = {
            allByResearch: allByResearch,
            save: save,
            load: load,
            remove: remove
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

        function load(id, attachments) {
            if (typeof attachments === 'undefined') {
                attachments = false;
            }
            return $q.when(db.get(id, {
                attachments: attachments
            })).then(function(doc){
                if(attachments && doc._attachments){
                    doc.photo = doc._attachments['photo'].data;
                }
                return doc;
            });
        }

        function remove(id) {
            return load(id).then(function(doc) {
                return db.remove(doc);
            });
        }

        function save(record) {
            if (record._id) {
                return $q.reject('Record cannot be updated');
            }

            if (!record.researchId) {
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

(function() {
    angular
        .module('botanika')
        .filter('seeMore', SeeMoreFilter);

    function SeeMoreFilter() {
        return function(input) {
            if (typeof input === 'undefined') return '';
            if (input.length > 150) {
                return input.substring(0, 150) + ' ... (ver detalhes)';
            } else {
                if (input.length == 0) {
                    return "Nenhuma descrição"
                }
                return input;
            }
        }
    }
})();

(function() {
    angular
        .module('botanika')
        .filter('location', LocationFilter);

    LocationFilter.$inject = ['$filter'];

    function LocationFilter($filter) {
        return function(input, decimals) {
            if (typeof input === 'undefined') return '';
            if (!input.lat && !input.lon) return '';

            if(typeof decimals === 'undefined'){
                decimals = 6;
            }

            return $filter('number')(input.lat, decimals) + ', ' + $filter('number')(input.lon, decimals);
        }
    }
})();

(function() {
    angular
        .module('botanika.research', []);
})();

(function() {
    angular
        .module('botanika.research')
        .controller('ResearchListController', ResearchListController);

    ResearchListController.$inject = ['Research', '$scope', '$ionicLoading'];

    function ResearchListController(Research, $scope, $ionicLoading) {
        var vm = this;

        $scope.$on('$ionicView.beforeEnter', function() {
            vm.researchs = [];
            reload();
        });
        vm.researchs = [];
        reload();

        vm.remove = remove;

        function reload() {
            vm.loading = true;
            Research.getAll().then(function(researchs) {
                vm.loading = false;
                vm.researchs = researchs;
            });
        };

        function remove(id) {
            $ionicLoading.show({
                template: 'Removendo projeto ...'
            });
            Research.remove(id).finally(function(result) {
                reload();
                $ionicLoading.hide();
            });
        }
    }
})();

(function() {
    angular
        .module('botanika.research')
        .controller('ResearchController', ResearchController);

    ResearchController.$inject = ['$state', '$ionicHistory', 'Research'];

    function ResearchController($state, $ionicHistory, Research) {
        var vm = this;

        var id = $state.params.id;
        vm.isEditing = !!id;

        var types = [
            "Numérico"
        ];
        vm.types = types;

        vm.addMetric = addMetric;
        vm.removeMetric = removeMetric;
        vm.saveResearch = saveResearch;

        if (vm.isEditing) {
            loadResearch(id);
        } else {
            resetResearch();
        }
        resetMetric();

        function loadResearch(id) {
            Research.load(id).then(function(research) {
                vm.research = research;
            });
        }

        function resetResearch() {
            vm.research = {
                metrics: [],
                name: "",
                description: ""
            }
        }

        function resetMetric() {
            vm.metric = {
                name: "",
                type: 0
            };
        }

        function addMetric() {
            var metric = angular.copy(vm.metric);
            vm.research.metrics.push(metric);
            resetMetric();
        }

        function removeMetric(index) {
            vm.research.metrics.splice(index, 1);
        }

        function saveResearch() {
            var research = angular.copy(vm.research);
            Research.save(research).then(function() {
                $ionicHistory.goBack();
            });
        }
    }
})();

(function() {
    angular
        .module('botanika.record', []);
})();

(function() {
    angular
        .module('botanika.research')
        .controller('RecordListController', RecordListController);

    RecordListController.$inject = ['Record', 'Research', '$state', '$scope', '$ionicNavBarDelegate'];

    function RecordListController(Record, Research, $state, $scope, $ionicNavBarDelegate) {
        var vm = this;

        var researchId = $state.params.researchId;
        $scope.$on('$ionicView.afterEnter', function() {
            Research.load(researchId).then(function(research) {
                $ionicNavBarDelegate.title(research.name);
            });
        });

        $scope.$on('$ionicView.beforeEnter', function() {
            vm.records = [];
            reload();
        });
        vm.records = [];
        reload();

        vm.remove = remove;

        function reload() {
            vm.loading = true;
            Record.allByResearch(researchId).then(function(records) {
                vm.loading = false;
                vm.records = records;
            });
        };

        function remove(id) {
            Record.remove(id).then(function() {
                vm.records = [];
                reload();
            });
        };

    }
})();

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

(function() {
    angular
        .module('botanika.config', [])
        .config(RouterConfig)
        .run(StatusBarConfig);

    RouterConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

    function RouterConfig($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('research', {
                url: "/research",
                templateUrl: "src/research/research.list.html",
                controller: 'ResearchListController as vm'
            })
            .state('research.new', {
                url: "/new",
                parent: 'research',
                views: {
                    '@': {
                        templateUrl: "src/research/research.edit.html",
                        controller: 'ResearchController as vm'
                    }
                }
            })
            .state('research.edit', {
                url: "/:id",
                parent: 'research',
                views: {
                    '@': {
                        templateUrl: "src/research/research.edit.html",
                        controller: 'ResearchController as vm'
                    }
                }
            })
            .state('research.records', {
                url: '/:researchId/records',
                parent: 'research',
                views: {
                    '@': {
                        templateUrl: "src/record/record.list.html",
                        controller: 'RecordListController as vm'
                    }
                }
            })
            .state('research.records.new', {
                url: '/new',
                parent: 'research.records',
                views: {
                    '@': {
                        templateUrl: "src/record/record.edit.html",
                        controller: 'RecordEditController as vm'
                    }
                }
            })
            .state('research.records.show', {
                url: '/:id',
                parent: 'research.records',
                views: {
                    '@': {
                        templateUrl: "src/record/record.edit.html",
                        controller: 'RecordEditController as vm'
                    }
                }
            });

        $urlRouterProvider.otherwise("/research");

    };

    StatusBarConfig.$inject = ['$ionicPlatform', '$cordovaStatusbar', '$cordovaKeyboard'];

    function StatusBarConfig($ionicPlatform, $cordovaStatusbar, $cordovaKeyboard) {
        $ionicPlatform.ready(function() {
            if (ionic.Platform.isIOS()) {
                $cordovaStatusbar.overlaysWebView(true);
                $cordovaStatusbar.style(1);

                $cordovaKeyboard.disableScroll(true);
            }
        });
    }

})();
