(function() {
    angular
        .module('botanika.research', []);
})();

(function() {
    angular
        .module('botanika.research')
        .controller('ResearchListController', ResearchListController);

    ResearchListController.$inject = ['$scope'];

    function ResearchListController($scope) {
        var vm = this;

        vm.researchs = [];
    }
})();

(function() {
    angular.module('botanika', ['ionic',
        'botanika.research',
        'botanika.config',
        'pouchdb'
    ]);
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
            });

        $urlRouterProvider.otherwise("/research");

    };
})();
