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

        function addMetric(metricForm) {
            if(metricForm.$valid){
                var metric = angular.copy(vm.metric);
                vm.research.metrics.push(metric);
                metricForm.$setPristine();
                resetMetric();
            }
        }

        function removeMetric(index) {
            vm.research.metrics.splice(index, 1);
        }

        function saveResearch(researchForm) {
            if(researchForm.$valid){
                var research = angular.copy(vm.research);
                Research.save(research).then(function() {
                    $ionicHistory.goBack();
                });
            }else{
                researchForm.$setDirty();
            }
        }
    }
})();
