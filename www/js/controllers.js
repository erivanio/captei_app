angular.module('starter.controllers', [])


.controller('LoginCtrl', function($scope, $http, $rootScope, $state) {
    $scope.message = '';
    $scope.login = function(user) {
        $http.post('http://app.captei.info/api-token-auth/', {
            username: user.email,
            password: user.password
        }).success(function (data) {
        $rootScope.token = data.token;
        $state.go('tab.listnews');
      })
      .error(function () {
        console.log('Error: Invalid user or password - '+ user.email +' - '+ user.password);
      });
    }
})

.controller('AlertasCtrl', function($scope, $stateParams, $rootScope, $http, $ionicLoading, $timeout, $ionicModal) {

    $http.get('http://app.captei.info/mobile/api-mobile/'+$rootScope.token+'/').success(function (data) {
            var tags = [];
            angular.forEach(data, function(perfil) {
                angular.forEach(perfil.tags, function(tag) {
                    tags.push(tag);
                });
            });
            $scope.tags = tags;
            console.log(tags);
    });

    $scope.alertLista = function () {
        $scope.alertas = [];
        $http({
            method: 'GET',
            url: 'http://app.captei.info/mobile/api-mobile/alertas/'+$rootScope.token+'/',
            params: {
                format: 'json'}
            }).success(function (data) {
                $scope.alertas = $scope.alertas.concat(data.results);
                $scope.next = data.next;
        });
    };

    $scope.alertLista();

    $scope.doRefresh = function() {
        $timeout( function() {
            $scope.alertLista();
            $scope.$broadcast('scroll.refreshComplete');
        }, 1000);
    };

    $scope.loadMore = function () {
        $timeout( function() {
            $http.get($scope.next).success(function (data) {
                $scope.alertas = $scope.alertas.concat(data.results);
                $scope.next = data.next;
                console.log(data.next);
            });
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 1000);
    };
    $scope.$on('$stateChangeSuccess', function() {
        $scope.loadMore();
    });

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $timeout(function() {
        $ionicLoading.hide();
    }, 500);

    $ionicModal.fromTemplateUrl('templates/modal-filter.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

})

.controller('InternaCtrl', function($scope, $http, $stateParams, $location, $rootScope, $ionicLoading, $timeout) {
    if($rootScope.token == undefined){
        $location.path('login');
    }
	$http({
        method: 'GET',
        url: 'http://app.captei.info/mobile/api-mobile/alertas/'+$rootScope.token+'/',
        params: {
            id: $stateParams.itemId,
            format: 'json'}
    }).success(function(data){
        $scope.alerta = data.results[0];
    });

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $timeout(function() {
        $ionicLoading.hide();
    }, 500);
})
//
//.controller('listNewsCtrl', function($scope, $ionicLoading, $timeout, $ionicModal) {
//    $scope.items = [{
//        id: 1,
//        image: 'data:image/jpeg;base64,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',
//        data_hora: 'há 10 minutos',
//        titulo: 'Dilma chora ao receber relatório final da Comissão da Verdade',
//        tag: 'dilma',
//        site: 'Globo.com'
//    }, {
//        id: 2,
//        image: 'https://t3.gstatic.com/images?q=tbn:ANd9GcR7EynbUZBHDYlCpG5AwGd0gvkZO3gI1o3TKCzt1w5w6SWwIBoCx0MIzZVWxiK_T0p1WQTdGXA',
//        data_hora: 'há 12 minutos',
//        hora: '',
//        titulo: 'Avril Lavigne diz a fãs que está com problemas de saúde',
//        tag: 'Avril Lavigne ',
//        site: 'globo.com'
//    }, {
//        id: 3,
//        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfnsyhfOctZCr2eZPt0ldwlvve1j9jcAsgxmbgGlwYuUy10J_CSZAVFDJR0OiVg6U3XBcu9CmF',
//        data_hora: '17 horas',
//        titulo: 'iPhone 6 torto está entre os vídeos mais populares do ano no YouTube',
//        tag: 'iphone',
//        site: 'Olhar Digital'
//    }, {
//        id: 4,
//        image: 'https://t3.gstatic.com/images?q=tbn:ANd9GcRHx2ES2zv_GCfLxPwR7sDwZXPadsDMDQmocoT84agQsoAfb6mokjszahCxZPgw-4x91MnwTDF_',
//        data_hora: '8 de dez de 2014',
//        titulo: 'Assistente virtual da Microsoft está a aprender quatro novas línguas',
//        tag: 'Microsoft',
//        site: 'Publico.pt'
//    }, {
//        id: 5,
//        image: 'https://t3.gstatic.com/images?q=tbn:ANd9GcRHx2ES2zv_GCfLxPwR7sDwZXPadsDMDQmocoT84agQsoAfb6mokjszahCxZPgw-4x91MnwTDF_',
//        data_hora: '8 de dez de 2014',
//        titulo: 'Assistente virtual da Microsoft está a aprender quatro novas línguas',
//        tag: 'Microsoft',
//        site: 'Publico.pt'
//    }, ];
//
//    // Setup the loader
//    $ionicLoading.show({
//        content: 'Loading',
//        animation: 'fade-in',
//        showBackdrop: true,
//        maxWidth: 200,
//        showDelay: 0
//    });
//
//    $timeout(function() {
//        $ionicLoading.hide();
//    }, 500);
//
//    $ionicModal.fromTemplateUrl('templates/modal-filter.html', {
//        scope: $scope
//    }).then(function(modal) {
//        $scope.modal = modal;
//    });
//})

//.controller('newsDetailCtrl', function($scope, $ionicLoading, $timeout) {
//    // Setup the loader
//    $ionicLoading.show({
//        content: 'Loading',
//        animation: 'fade-in',
//        showBackdrop: true,
//        maxWidth: 200,
//        showDelay: 0
//    });
//
//    $timeout(function() {
//        $ionicLoading.hide();
//    }, 500);
//})

.controller('addtagCtrl', function($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/modal-addtag.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
})

.controller('settingsCtrl', function($scope) {});
