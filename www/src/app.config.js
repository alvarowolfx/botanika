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
