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
