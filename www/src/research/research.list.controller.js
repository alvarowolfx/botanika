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
