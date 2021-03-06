// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives','ngSanitize', 'yaru22.angular-timeago'])

//.filter('hrefToJS', function($sce, $sanitize) {
//    return function(text) {
//        var regex = /href="([\S]+)"/g;
//        var newString = $sanitize(text).replace(regex, "onClick=\"window.open('$1', '_system', 'location=yes')\"");
//        return $sce.trustAsHtml(newString);
//    }
//})
// testando este filtro
.filter('externalLinks', function() {
    return function(text) {
        return String(text).replace(/href=/gm, "class=\"ex-link\" href=");
    }
})

.run(function($ionicPlatform, $rootScope, $location) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    $rootScope.location = $location;
})

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])

.config(function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    .state('signin', {
        url: "/sign-in",
        templateUrl: "templates/sign-in.html",
        controller: 'LoginCtrl'
    })

    .state('intro', {
        url: "/intro",
        templateUrl: "templates/intro.html",
        controller: 'IntroCtrl'
    })


    // setup an abstract state for the tabs directive
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.listnews', {
        url: '/listnews',
        views: {
            'tab-listnews': {
                templateUrl: 'templates/tab-listnews.html',
                controller: 'AlertasCtrl'
            }
        }
    })

    .state('tab.news-detail', {
        url: '/item/:itemId',
        views: {
            'tab-listnews': {
                templateUrl: 'templates/news-detail.html',
                controller: 'InternaCtrl'
            }
        }
    })


    .state('tab.addtag', {
        url: '/addtag',
        views: {
            'tab-addtag': {
                templateUrl: 'templates/tab-addtag.html',
                controller: 'addtagCtrl'
            }
        }
    })


    .state('tab.settings', {
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/tab-settings.html',
                controller: 'settingsCtrl'
            }
        }
    })

    .state('tab.relatar-problema', {
        url: '/relatar-problema',
        views: {
            'tab-settings': {
                templateUrl: 'templates/relatar-problema.html',
                controller: 'relatarProblemaCtrl'
            }
        }
    })

    .state('tab.termos-privacidade', {
        url: '/termos-privacidade',
        views: {
            'tab-settings': {
                templateUrl: 'templates/termos-privacidade.html',
                controller: 'settingsCtrl'
            }
        }
    })

    .state('tab.sobre', {
        url: '/sobre',
        views: {
            'tab-settings': {
                templateUrl: 'templates/sobre.html',
                controller: 'settingsCtrl'
            }
        }
    })

    .state('tab.alterar-senha', {
        url: '/alterar-senha',
        views: {
            'tab-settings': {
                templateUrl: 'templates/alterar-senha.html',
                controller: 'settingsCtrl'
            }
        }
    })

    .state('tab.central-ajuda', {
        url: '/central-ajuda',
        views: {
            'tab-settings': {
                templateUrl: 'templates/central-ajuda.html',
                controller: 'settingsCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise("/sign-in");


});
