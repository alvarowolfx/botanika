(function() {
    angular.module('botanika', ['ionic',
        'botanika.research',
        'botanika.config',
        'pouchdb'
    ]);
})();

(function() {
    angular.module('botanika')
        .service('Research', Research);

    Research.$inject = ['$http', '$q', 'pouchDB'];

    function Research($http, $q, pouchDB) {

        var service = {
            getAll: getAll,
            load: load,
            remove: remove,
            save: save
        }

        var db = pouchDB('botanika');

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

        var researchDesignDoc = createDesignDoc('research', function(doc) {
            if (doc.type === 'research') {
                emit(doc._id);
            };
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
        angular
            .module('botanika')
            .filter('seeMore', SeeMoreFilter);

        function SeeMoreFilter() {
            return function(input) {
                if (typeof input === 'undefined') return '';
                if (input.length > 150) {
                    return input.substring(0, 150) + ' ... (ver detalhes)';
                } else {
                    if(input.length == 0){
                        return "Nenhuma descrição"
                    }
                    return input;
                }
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

        $scope.$on('$ionicView.beforeEnter', function(){
            vm.researchs = [];
            reload();
        });
        vm.researchs = [];
        reload();

        vm.remove = remove;

        function reload(){
            vm.loading = true;
            Research.getAll().then(function(researchs) {
                vm.loading = false;
                vm.researchs = researchs;
            });
        };

        function remove(id){
            $ionicLoading.show({
                template: 'Removendo projeto ...'
            });
            Research.remove(id).finally(function(result){
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
        .module('botanika.config', [])
        .config(Config);

    Config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function Config($stateProvider, $urlRouterProvider) {

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
            });

        $urlRouterProvider.otherwise("/research");

    };
})();
