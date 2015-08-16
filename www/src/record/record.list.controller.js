(function() {
    angular
        .module('botanika.record')
        .controller('RecordListController', RecordListController);

    RecordListController.$inject = ['Record', 'Research', '$scope', 'research'];

    function RecordListController(Record, Research, $scope, research) {
        var vm = this;

        vm.research = research;
        var researchId = research._id;

        $scope.$on('$ionicView.beforeEnter', function () {
            vm.records = [];
            reload();
        });

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
