(function() {
    angular
        .module('botanika')
        .filter('location', LocationFilter);

    LocationFilter.$inject = ['$filter'];

    function LocationFilter($filter) {
        return function(input, decimals) {
            if (typeof input === 'undefined') return '';
            if (!input.lat && !input.lon) return '';

            if(typeof decimals === 'undefined'){
                decimals = 6;
            }

            return $filter('number')(input.lat, decimals) + ', ' + $filter('number')(input.lon, decimals);
        }
    }
})();
