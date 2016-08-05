//http://lgorithms.blogspot.com/2013/07/angularui-router-as-infrastructure-of.html
//http://www.funnyant.com/angularjs-ui-router/
var StreamEst;
(function (StreamEst) {
    //'use strict';
    var config = (function () {
        function config($stateProvider, $urlRouterProvider, $locationProvider, $logProvider) {
            this.$stateProvider = $stateProvider;
            this.$urlRouterProvider = $urlRouterProvider;
            this.$locationProvider = $locationProvider;
            this.$logProvider = $logProvider;
            this.$stateProvider
                .state("main", {
                url: '/?workspaceID',
                //reloadOnSearch:true,
                template: '<ui-view/>',
                views: {
                    'map': {
                        templateUrl: "Views/mapview.html",
                        controller: "StreamEst.Controllers.MapController"
                    },
                    'sidebar': {
                        templateUrl: "Views/sidebarview.html",
                        //abstract:true,
                        controller: "StreamEst.Controllers.SidebarController"
                    },
                    'navbar': {
                        templateUrl: "Views/navigationview.html",
                        controller: "StreamEst.Controllers.NavbarController"
                    },
                    'report': {
                        templateUrl: "Views/reportview.html",
                        controller: "StreamEst.Controllers.ReportController"
                    }
                }
            }); //end main state 
            this.$urlRouterProvider.otherwise('/');
            this.$locationProvider.html5Mode(true);
            //turns of angular-leaflet console spam
            this.$logProvider.debugEnabled(false);
        } //end constructor
        config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider'];
        return config;
    })(); //end class
    var run = (function () {
        function run(notificationService) {
            this.notificationService = notificationService;
            console.log("got it", this.notificationService);
        } //end constructor
        run.$inject = ['StreamEst.Services.NotificationService'];
        return run;
    })(); //end class
    angular.module('StreamEst', [
        'ui.router', 'ui.bootstrap', 'ui.checkbox',
        'mobile-angular-ui',
        'angulartics', 'angulartics.google.analytics',
        'toaster', 'ngAnimate', 'ngFileUpload', 'nvd3',
        'leaflet-directive',
        'StreamEst.Services',
        'StreamEst.Controllers',
        'WiM.Services', 'WiM.Event', 'wim_angular', 'daterangepicker'
    ])
        .config(config)
        .run(run);
})(StreamEst || (StreamEst = {})); //end module 
//# sourceMappingURL=config.js.map