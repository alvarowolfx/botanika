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
