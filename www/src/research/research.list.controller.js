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
