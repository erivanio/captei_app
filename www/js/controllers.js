angular.module('starter.controllers', [])


    .controller('LoginCtrl', function ($scope, $http, $rootScope, $state, $ionicPopup, $timeout, $ionicModal, $window) {
        $scope.message = '';

        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Email e/ou senha inválida',
                template: '<h1 class="ion-alert-circled"></h1><h4>Tente novamente</h4>',
                okType: 'button-small'
            });

            $timeout(function () {
                alertPopup.close();
            }, 3000);
        };

        if ($window.localStorage['token'] != undefined) {
            $rootScope.token = $window.localStorage['token'];
            $state.go('tab.listnews');
        }

        $scope.esqueceuSenha = function (email) {
            $http.post('http://app.captei.info/mobile/esqueceu-a-senha/', {
                email: email
            }).success(function (data) {
                console.log('deu certo: ' + data);
                $scope.oModal2.hide();
            }).error(function (data) {
                console.log('deu errado: ' + data);
                $scope.oModal2.hide();
            });
        };

        $scope.cadastrar = function (user) {
            $http({
                method: 'POST',
                url: 'http://app.captei.info/cadastre-se/',
                data: $.param({
                    nome: user.nome,
                    email: user.email,
                    password1: user.password,
                    password2: user.password2,
                    mobile: 'true'
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function () {
                $http({
                    method: 'POST',
                    url: 'http://app.captei.info/mobile/token/',
                    data: $.param({username: user.email, password: user.password}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (data) {
                    $rootScope.token = data.token;
                    $scope.oModal1.hide();
                    $state.go('intro');
                })
            });
        };

        $scope.login = function (user) {
            console.log(user);
            $http({
                method: 'POST',
                url: 'http://app.captei.info/mobile/token/',
                data: $.param({username: user.email, password: user.password}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (data) {
                console.log('sucesso');
                $rootScope.token = data.token;
                if (user.remember == true) {
                    $window.localStorage['token'] = data.token;
                } else {
                    $window.localStorage.removeItem('token');
                }
                $state.go('intro');
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
        }).then(function (modal) {
            $scope.oModal1 = modal;
        });

        // Modal Esqueci minha senha
        $ionicModal.fromTemplateUrl('modal-new-password.html', {
            id: '2',
            scope: $scope,
            backdropClickToClose: false,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.oModal2 = modal;
        });

        $scope.openModal = function (index) {
            if (index == 1) $scope.oModal1.show();
            else $scope.oModal2.show();
        };

        $scope.closeModal = function (index) {
            if (index == 1) $scope.oModal1.hide();
            else $scope.oModal2.hide();
        };

    })

    .controller('IntroCtrl', function ($scope, $window, $state, $ionicSlideBoxDelegate) {

        // Called to navigate to the main app
        $scope.startApp = function () {
            $state.go('tab.addtag');
            window.localStorage['didTutorial'] = true;
        };

        //No this is silly
        // Check if the user already did the tutorial and skip it if so
        if (window.localStorage['didTutorial'] === "true") {
            console.log('Skip intro');
            $state.go('tab.listnews');
        }

        $scope.next = function () {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function () {
            $ionicSlideBoxDelegate.previous();
        };

        // Called each time the slide changes
        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;
        };
    })


    .controller('AlertasCtrl', function ($scope, $stateParams, $rootScope, $http, $timeout, $ionicModal, $window) {

        $scope.pegaTags = function () {
            $http.get('http://app.captei.info/mobile/api-mobile/' + $rootScope.token + '/').success(function (data) {
                var tags = [{"id": 0, "nome": "Todas"}];
                angular.forEach(data, function (perfil) {
                    angular.forEach(perfil.tags, function (tag) {
                        tags.push(tag);
                    });
                });
                $rootScope.tags = tags;
            });
        };

        if ($rootScope.tags == undefined) {
            $scope.pegaTags();
        } else {
            $scope.tags = $rootScope.tags;
        }

        $scope.resetaFiltro = function () {
            $("#data-inicio").val(null);
            $("#data-fim").val(null);
            $("#q").val(null);
            $("#orderList").val('-noticia__data_publicacao');
            $("#classificacaoList").val('');
            $window.localStorage.removeItem('tag');
            $scope.alertLista();
        };

        $scope.salvaFiltro = function () {
            $window.localStorage['tag'] = $scope.tagSelecionada;
        };

        $scope.alertLista = function () {
            var order = $("#orderList option:selected").val();
            var classificacao = $("#classificacaoList option:selected").val();
            var q = $("#q").val();
            var dia_inicio = $("#data-inicio").val();
            var dia_fim = $("#data-fim").val();
            var tag_val = [];
            if (!isNaN($window.localStorage['tag'])) {
                if ($window.localStorage['tag'] != 0) {
                    tag_val.push($window.localStorage['tag']);
                } else {
                    angular.forEach($rootScope.tags, function (tag) {
                        tag_val.push(tag.id);
                    });
                }
            } else {
                angular.forEach($rootScope.tags, function (tag) {
                    tag_val.push(tag.id);
                });
            }
            $scope.alertas = [];
            if (order == undefined || order == '') {
                order = '-noticia__data_publicacao';
            }
            if (dia_inicio == undefined || dia_inicio == '') {
                dia_inicio = null;
            }
            if (dia_fim == undefined || dia_fim == '') {
                dia_fim = null;
            }
            $http({
                method: 'GET',
                url: 'http://app.captei.info/mobile/api-mobile/alertas/' + $rootScope.token + '/',
                params: {
                    q: q,
                    tags: tag_val,
                    order: order,
                    data_inicio: dia_inicio,
                    data_fim: dia_fim,
                    classificacao: classificacao,
                    format: 'json'
                }
            }).success(function (data) {
                console.log('*****sucesso: ' + tag_val + ' - ' + order + " - " + dia_inicio + " - " + dia_fim + " - " + q);
                $scope.alertas = $scope.alertas.concat(data.results);
                $scope.next = data.next;
            });
        };

        $scope.alertLista();

        $scope.doRefresh = function () {
            $timeout(function () {
                $scope.alertLista();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.loadMore = function () {
            $timeout(function () {
                $http.get($scope.next).success(function (data) {
                    $scope.alertas = $scope.alertas.concat(data.results);
                    $scope.next = data.next;
                    console.log(data.next);
                });
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 1000);
        };
        $scope.$on('$stateChangeSuccess', function () {
            $scope.loadMore();
        });

        $ionicModal.fromTemplateUrl('templates/modal-filter.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

    })

    .controller('InternaCtrl', function ($scope, $http, $stateParams, $location, $rootScope, $state) {
        if ($rootScope.token == undefined) {
            $location.path('login');
        }
        $http({
            method: 'GET',
            url: 'http://app.captei.info/mobile/api-mobile/alertas/' + $rootScope.token + '/',
            params: {
                id: $stateParams.itemId,
                format: 'json'
            }
        }).success(function (data) {
            $scope.alerta = data.results[0];
        });

        $scope.updateAlerta = function (classificacao) {
            $http({
                method: 'PUT',
                url: 'http://app.captei.info/mobile/update-classificacao/' + $stateParams.itemId + '/',
                data: $.param({classificacao: classificacao, status: true}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function () {
                if (classificacao == 1) {
                    $("#btnPositivo").addClass("button-energized");
                    $("#btnNegativo").removeClass("button-energized");
                    $("#btnNeutro").removeClass("button-energized");
                }
                if (classificacao == 2) {
                    $("#btnPositivo").removeClass("button-energized");
                    $("#btnNegativo").addClass("button-energized");
                    $("#btnNeutro").removeClass("button-energized");
                }
                if (classificacao == 4) {
                    $("#btnPositivo").removeClass("button-energized");
                    $("#btnNegativo").removeClass("button-energized");
                    $("#btnNeutro").addClass("button-energized");
                }
            });
        };

        $scope.openDeviceBrowser = function (externalLinkToOpen) {
            window.open(externalLinkToOpen, '_system', 'location=no');
        };

        $scope.goBack = function () {
            $state.go('tab.listnews');
        }


    })

    .controller('addtagCtrl', function ($scope, $ionicModal, $ionicLoading, $state, $rootScope, $http) {

        $scope.loadTags = function () {
            $http.get('http://app.captei.info/mobile/api-mobile/' + $rootScope.token + '/').success(function (data) {
                var tags = [];
                angular.forEach(data, function (perfil) {
                    angular.forEach(perfil.tags, function (tag) {
                        tags.push(tag);
                    });
                });
                $scope.tags = tags;
                $scope.perfil_key = data[0].key;
            });
            $http.get('http://app.captei.info/mobile/api-usuario/' + $rootScope.token + '/').success(function (data) {
                $scope.quantidade_tag = data[0].quantidade_tag;
                if (data[0].pacote_tag == undefined) {
                    $scope.plano_quantidade = 2;
                } else {
                    $scope.plano_quantidade = data[0].pacote_tag.quantidade;
                }
            });

        };

        $scope.loadTags();

        $scope.comparaTag = function (TagId) {
            var ids = [];
            angular.forEach($rootScope.tags, function (obj) {
                ids.push(obj.id);
            });
            var count = ids.length;
            for (var i = 0; i < count; i++) {
                if (TagId === ids[i]) {
                    return true;
                }
            }
            return false;
        };

        $scope.addTag = function (tag_adicionada) {
            $http({
                method: 'POST',
                url: 'http://app.captei.info/mobile/add-tag/' + $rootScope.token + '/',
                data: $.param({tags: tag_adicionada, key: $scope.perfil_key}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function () {
                $scope.loadTags();
                $ionicLoading.show({
                    template: 'Aguarde...',
                    duration: 3000
                });
            });
            $scope.modal.hide();
        };


        $scope.selecionarTags = function (tags) {
            var resultTags = [];
            angular.forEach(tags, function (tag) {
                if (tag.isSelected) {
                    resultTags.push({"id": tag.id, "nome": tag.nome});
                }
            });
            resultTags.unshift({"id": 0, "nome": "Todas"});
            console.log(resultTags);
            $rootScope.tags = resultTags;
            $state.go('tab.listnews', null, {reload: true});
        };

        $ionicModal.fromTemplateUrl('templates/modal-addtag.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });
    })

    .controller('settingsCtrl', function ($scope, $window, $state, $rootScope) {
        $scope.logout = function () {
            delete $rootScope.tags;
            $window.localStorage.removeItem('token');
            $window.localStorage.removeItem('tag');
            $state.go('signin');
        }
    });
