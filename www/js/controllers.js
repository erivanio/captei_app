angular.module('starter.controllers', [])


.controller('LoginCtrl', function($scope, $http, $rootScope, $state, $ionicPopup, $timeout) {
    $scope.message = '';
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Falha no login',
            template: '<h1 class="ion-alert-circled"></h1><h4>Tente novamente</h4>', // String (optional). The html template to place in the popup body.
            okType: 'button-small', // String (default: 'button-positive'). The type of the OK button.
        });
       
        $timeout(function() {
            alertPopup.close(); 
        }, 3000);
    };

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
        showAlert();
      });
    };

})


.controller('AlertasCtrl', function($scope, $stateParams, $rootScope, $http, $timeout, $ionicModal) {

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

    $scope.busca = function () {
        var order = $("#orderList option:selected").val();
        $scope.alertas = [];
        if($scope.tagSelecionada != undefined && $scope.tagSelecionada != ''){
            var tag = $scope.tagSelecionada.id;
        }
        if(order == undefined || order == ''){
            order = '-noticia__data_publicacao';
            console.log(order);
        }
        $http({
            method: 'GET',
            url: 'http://app.captei.info/mobile/api-mobile/alertas/'+$rootScope.token+'/',
            params: {
                tags: tag,
                order: order,
                format: 'json'}
            }).success(function (data) {
                console.log(tag+' - '+$scope.orderList+' - '+order);
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

    $ionicModal.fromTemplateUrl('templates/modal-filter.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

})

.controller('InternaCtrl', function($scope, $http, $stateParams, $location, $rootScope, $timeout) {
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

    $scope.goBack = function() {
            window.history.go(-1);
    }

   
})

.controller('addtagCtrl', function($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/modal-addtag.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
})

.controller('settingsCtrl', function($scope) {});
