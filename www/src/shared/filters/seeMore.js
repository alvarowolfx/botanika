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
