angular.module('starter.controllers', [])


.controller('LoginCtrl', function($scope, $http, $rootScope, $state, $ionicPopup, $timeout, $ionicModal, $window) {
    $scope.message = '';

    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Email e/ou senha inválida',
            template: '<h1 class="ion-alert-circled"></h1><h4>Tente novamente</h4>',
            okType: 'button-small'
        });
       
        $timeout(function() {
            alertPopup.close(); 
        }, 3000);
    };

    if($window.localStorage['token'] != undefined){
        $rootScope.token = $window.localStorage['token'];
        $state.go('tab.listnews');
    }

    $scope.esqueceuSenha = function(email) {
        $http.post('http://app.captei.info/mobile/esqueceu-a-senha/', {
            email: email
        }).success(function (data) {
            console.log('deu certo: '+ data);
            $scope.oModal2.hide();
        }).error(function (data) {
            console.log('deu errado: '+ data);
            $scope.oModal2.hide();
        });
    };

    $scope.cadastrar = function(user) {
        $http({
            method: 'POST',
            url: 'http://app.captei.info/cadastre-se/',
            data: $.param({nome: user.nome, email: user.email, password1: user.password, password2: user.password2, mobile: 'true'}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function () {
            $scope.login(user);
        })
    };

    $scope.login = function(user) {
        console.log(user);
        $http({
            method: 'POST',
            url: 'http://app.captei.info/mobile/token/',
            data: $.param({username: user.email, password: user.password}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data) {
            $rootScope.token = data.token;
            if(user.remember == true){
                $window.localStorage['token'] = data.token;
            }else{
                $window.localStorage.clear();
            }
            $scope.oModal1.hide();
            $state.go('tab.listnews');
        }).error(function (data) {
            $scope.showAlert();
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


.controller('AlertasCtrl', function($scope, $stateParams, $rootScope, $http, $timeout, $ionicModal, $window) {

    $scope.pegaTags = function(){
        $http.get('http://app.captei.info/mobile/api-mobile/'+$rootScope.token+'/').success(function (data) {
            var tags = [{"id": 0, "nome": "Todas"}];
            angular.forEach(data, function(perfil) {
                angular.forEach(perfil.tags, function(tag) {
                    tags.push(tag);
                });
            });
            $rootScope.tags = tags;
        });
    };

    if($rootScope.tags == undefined){
        $scope.pegaTags();
    }else{
        $scope.tags = $rootScope.tags;
    }

    $scope.resetaFiltro = function() {
        $("#data-inicio").val(null);
        $("#data-fim").val(null);
        $("#q").val(null);
        $("#orderList").val('-noticia__data_publicacao');
        $("#classificacaoList").val('');
        $window.localStorage['tag'].clear();
        $scope.alertLista();
    };

    $scope.salvaFiltro = function() {
        $window.localStorage['tag'] = $scope.tagSelecionada;
    };

    $scope.alertLista = function () {
        var order = $("#orderList option:selected").val();
        var classificacao = $("#classificacaoList option:selected").val();
        var q = $("#q").val();
        var dia_inicio = $("#data-inicio").val();
        var dia_fim = $("#data-fim").val();
        var tag_val = [];
        if(!isNaN($window.localStorage['tag'])){
            if($window.localStorage['tag'] != 0 ){
                tag_val.push($window.localStorage['tag']);
            }else{
                angular.forEach($rootScope.tags, function(tag) {
                    tag_val.push(tag.id);
                });
            }
        }else{
            angular.forEach($rootScope.tags, function(tag) {
                tag_val.push(tag.id);
            });
        }
        console.log("valor do tag_val: "+tag_val);
        $scope.alertas = [];
        if(order == undefined || order == ''){
            order = '-noticia__data_publicacao';
        }
        if(dia_inicio == undefined || dia_inicio == ''){
            dia_inicio = null;
        }
        if(dia_fim == undefined || dia_fim == ''){
            dia_fim = null;
        }
        $http({
            method: 'GET',
            url: 'http://app.captei.info/mobile/api-mobile/alertas/'+$rootScope.token+'/',
            params: {
                q: q,
                tags: tag_val,
                order: order,
                data_inicio: dia_inicio,
                data_fim: dia_fim,
                classificacao: classificacao,
                format: 'json'}
            }).success(function (data) {
                console.log('*****sucesso: '+tag_val+' - '+order+" - "+dia_inicio+" - "+dia_fim+" - "+q);
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

    $scope.openDeviceBrowser = function(externalLinkToOpen) {
      window.open(externalLinkToOpen, '_system', 'location=no');
    };

    $scope.goBack = function() {
        $state.go('tab.listnews');
    }


})

.controller('addtagCtrl', function($scope, $ionicModal, $state, $rootScope, $http) {
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

    $scope.selecionarTags = function (tags) {
        var resultTags = [];
        angular.forEach(tags, function(tag) {
            if(tag.isSelected){
                 resultTags.push({"id":tag.id, "nome":tag.nome});
            }
        });
        resultTags.unshift({"id": 0, "nome": "Todas"});
        console.log(resultTags);
        $rootScope.tags = resultTags;
        $state.go('tab.listnews');
    };

    $ionicModal.fromTemplateUrl('templates/modal-addtag.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
})

.controller('settingsCtrl', function($scope, $window, $state) {
     $scope.logout = function() {
         $window.localStorage.clear();
         $state.go('signin');
    }
});
