//------------------------------------------------------------------------------
//----- NavbarController ------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//04.14.2015 jkn - Created

//Imports"
module StreamEst.Controllers {
    'use strict';
    interface INavbarControllerScope extends ng.IScope {
        vm: NavbarController;
    }
    interface INavbarController {
    }

    class NavbarController extends WiM.Services.HTTPServiceBase implements INavbarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalService: Services.IModalService;
        private cookies: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamEst.Services.ModalService'];
        constructor($scope: INavbarControllerScope, $http: ng.IHttpService, modal: Services.IModalService) {
            super($http, configuration.baseurls.StreamEstServices);
            $scope.vm = this;
            this.modalService = modal;

            this.modalService.openModal(Services.SSModalType.e_about, { tabName:"disclaimer"});
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-

        public openReport(): void {
            this.modalService.openModal(Services.SSModalType.e_report);
        }

        public openAbout(): void {
            this.modalService.openModal(Services.SSModalType.e_about);
        }


        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public readCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        public createCookie(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toUTCString();
            }
            else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        }

    }//end class
    angular.module('StreamEst.Controllers')
        .controller('StreamEst.Controllers.NavbarController', NavbarController)

}//end module
  