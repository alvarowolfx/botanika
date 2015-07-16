(function() {
    angular
        .module('botanika.config', [])
        .config(RouterConfig)
        .config(StatusBarConfig);

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
            });

        $urlRouterProvider.otherwise("/research");

    };

    StatusBarConfig.$inject = ['$ionicPlatform', '$cordovaStatusbar'];

    function StatusBarConfig($ionicPlatform, $cordovaStatusbar) {
        $ionicPlatform.ready(function() {
            if ($ionicPlatform.isIOS()) {
                $cordovaStatusbar.overlaysWebView(true);
                $cordovaStatusbar.style(0);
            }
        });
    }

})();
