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

    $scope.buscaTag = function () {
        $scope.alertas = [];
        $http({
            method: 'GET',
            url: 'http://app.captei.info/mobile/api-mobile/alertas/'+$rootScope.token+'/',
            params: {
                tags: $scope.tagSelecionada.id,
                format: 'json'}
            }).success(function (data) {
                $scope.alertas = $scope.alertas.concat(data.results);
                $scope.next = data.next;
        });
    };

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

.controller('addtagCtrl', function($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/modal-addtag.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
})

.controller('settingsCtrl', function($scope) {});
