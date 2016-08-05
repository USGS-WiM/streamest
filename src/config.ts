//http://lgorithms.blogspot.com/2013/07/angularui-router-as-infrastructure-of.html
//http://www.funnyant.com/angularjs-ui-router/

declare var configuration: any;
declare var Citations: Array<StreamEst.Models.ICitation>;
declare var moment: any;
module StreamEst {
    //'use strict';

    class config {
        static $inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider'];
        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider, private $locationProvider: ng.ILocationProvider, private $logProvider: ng.ILogProvider) {
            this.$stateProvider
                .state("main", {
                url: '/?workspaceID',
                //reloadOnSearch:true,
                template:'<ui-view/>',
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
            })//end main state 
          
            this.$urlRouterProvider.otherwise('/');     
            
            this.$locationProvider.html5Mode(true);   
            
            //turns of angular-leaflet console spam
            this.$logProvider.debugEnabled(false); 
                                 
        }//end constructor
    }//end class
    class run {
        static $inject = ['StreamEst.Services.NotificationService'];
        constructor(private notificationService: Services.INotificationService) {
            console.log("got it", this.notificationService)
        }//end constructor
    }//end class
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
        //.run(run);
       
    
}//end module 