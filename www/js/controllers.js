angular.module('starter.controllers', [])


.controller('LoginCtrl', function($scope, $http, $rootScope, $state, $ionicPopup, $timeout, $ionicModal) {
    $scope.message = '';
    
     $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Falha no login',
            template: '<h1 class="ion-alert-circled"></h1><h4>Tente novamente</h4>',
            okType: 'button-small', 
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

      // Modal Cadastre-se
    $ionicModal.fromTemplateUrl('modal-new-account.html', {
      id: '1',
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.oModal1 = modal;
    });

    // Modal Esqueci minha senha
    $ionicModal.fromTemplateUrl('modal-new-password.html', {
      id: '2',
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.oModal2 = modal;
    });

    $scope.openModal = function(index) {
      if(index == 1) $scope.oModal1.show();
      else $scope.oModal2.show();
    };

    $scope.closeModal = function(index) {
      if(index == 1) $scope.oModal1.hide();
      else $scope.oModal2.hide();
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
        var order = $("#orderList option:selected").val();
        var tag_val = $scope.tagSelecionada;
        $scope.alertas = [];
        if(order == undefined || order == ''){
            order = '-noticia__data_publicacao';
            console.log(order);
        }
        if(tag_val == undefined || tag_val == ''){
            tag_val = null;
        }

        console.log(order+" - " + $scope.tagSelecionada);

        $http({
            method: 'GET',
            url: 'http://app.captei.info/mobile/api-mobile/alertas/'+$rootScope.token+'/',
            params: {
                tags: tag_val,
                order: order,
                format: 'json'}
            }).success(function (data) {
                console.log('*****sucesso: '+tag_val+' - '+order);
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

    $ionicModal.fromTemplateUrl('templates/modal-filter.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

})

.controller('InternaCtrl', function($scope, $http, $stateParams, $location, $rootScope, $state) {
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
        $state.go('tab.listnews');
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
