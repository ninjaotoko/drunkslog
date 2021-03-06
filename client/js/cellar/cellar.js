define(["resources"], function() {

    var cellar = angular.module('dl.cellar', ['dl.resources']);

    cellar.factory("CellarService", ['Cellar',function(Cellar) {
        var cellars = [];
        return {
            loadMyCellar: function() {
                cellars = Cellar.query();
            },
            countByBeer: function(beer) {
                var f = util.Arrays.filter(cellars, function(item) {
                    return item.beer == beer._id ? 0 : -1;
                });
                if ( f.length != 0 ) {
                    return f[0].amount;
                } else {
                    return '-';
                }
            },
            incBeer: function(beer) {
                var f = util.Arrays.filter(cellars, function(item) {
                    return item.beer == beer._id ? 0 : -1;
                });
                if ( f.length == 0 ) {
                    var cellar = new Cellar();
                    cellar._id = beer.name.replace(/[^a-z0-9]/ig, '') + new Date().getTime();
                    cellar.beer = beer._id;
                    cellar.amount = 1;
                    cellar.date = new Date();
                    cellar.$save(function(saved) {
                        cellars.push(saved);
                    });
                } else {
                    f[0].amount++;
                    f[0].$save()
                }
                
            },
            decBeer: function(beer) {
                var f = util.Arrays.filter(cellars, function(item) {
                    return item.beer == beer._id ? 0 : -1;
                });
                if ( f.length != 0 ) {
                    f[0].amount--;
                    f[0].$save()
                }
                
            }
        };
    }]);

    cellar.controller("CellarController", ['$scope','CellarService','Cellar','$translate','$filter', 'DLHelper', 'Cache',
        function($scope,CellarService,Cellar,$translate,$filter,DLHelper, Cache) {

            $scope.styles = {};
            Cache.styles(function(styles) {
                angular.forEach(styles, function(style) {
                    $scope.styles[style._id] = style;
                });
            });

            $scope.config = {
                data: Cellar,
                collection: Cellar.query({populate:true}, function(cellars) {
                    $scope.bottleCount = 0;
                    angular.forEach(cellars, function(c) {
                        $scope.bottleCount += c.amount;
                    });
                }),
                name: $translate('beer.data.beer')+'s',
                singular: $translate('beer.data.beer'),
                orderBy: "amount",
                orderDir: "-",
                pageSize: 20,
                headers: [{
                        field:'beer.name',
                        caption: $translate('beer.data.beer'),
                        type: 'link',
                        href: function(row) {return '#/beer/detail/' + row.beer._id;},
                        class: function(cellar) {
                            if ( cellar.amount == 0 ) {
                                return 'dl-line-through';
                            }
                        }
                    },{
                        field: 'beer.style',
                        caption: 'Estilo',
                        title: function(rating) {
                            return rating ? $scope.styles[rating.beer.style].name : null;
                        },
                        format: function(value) {
                            return value.toUpperCase();
                        }
                    },{
                        field:'beer.score.avg',
                        caption: $translate('beer.data.score'),
                        width: '7em',
                        tooltip: $translate('beer.data.score.help'),
                        class: function(cellar) {
                            if ( cellar.beer.score ) {
                                return 'badge alert-' + DLHelper.colorByScore(cellar.beer.score.avg);        
                            } else {
                                return 'badge';
                            }
                        }
                    },{
                        field: 'amount',
                        width: '10em',
                        caption: $translate('cellar.amount'),
                        class: function(cellar) {
                            if ( cellar.amount == 0 ) {
                                return 'dl-line-through';
                            }
                        }
                    },{
                        field:'date',
                        caption: 'Fecha',
                        width: '14em',
                        format: function(value) {
                            return $filter('date')(value,'dd-MM-yyyy');
                        }
                    }
                ]
            };

            $scope.clearZeros = function() {
                Cellar.clearZeros(function() {
                    $scope.config.collection= Cellar.query({populate:true}, function(cellars) {
                        $scope.bottleCount = 0;
                        angular.forEach(cellars, function(c) {
                            $scope.bottleCount += c.amount;
                        });
                    });
                });
            }
    
    }]);


    return cellar;
});