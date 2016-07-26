//------------------------------------------------------------------------------
//----- NavbarController ------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var StreamEst;
(function (StreamEst) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var NavbarController = (function (_super) {
            __extends(NavbarController, _super);
            function NavbarController($scope, $http, modal) {
                _super.call(this, $http, configuration.baseurls.StreamEstServices);
                $scope.vm = this;
                this.modalService = modal;
                this.modalService.openModal(StreamEst.Services.SSModalType.e_about, { tabName: "disclaimer" });
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.prototype.openReport = function () {
                this.modalService.openModal(StreamEst.Services.SSModalType.e_report);
            };
            NavbarController.prototype.openAbout = function () {
                this.modalService.openModal(StreamEst.Services.SSModalType.e_about);
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.prototype.readCookie = function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ')
                        c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0)
                        return c.substring(nameEQ.length, c.length);
                }
                return null;
            };
            NavbarController.prototype.createCookie = function (name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    var expires = "; expires=" + date.toUTCString();
                }
                else
                    var expires = "";
                document.cookie = name + "=" + value + expires + "; path=/";
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.$inject = ['$scope', '$http', 'StreamEst.Services.ModalService'];
            return NavbarController;
        })(WiM.Services.HTTPServiceBase); //end class
        angular.module('StreamEst.Controllers')
            .controller('StreamEst.Controllers.NavbarController', NavbarController);
    })(Controllers = StreamEst.Controllers || (StreamEst.Controllers = {}));
})(StreamEst || (StreamEst = {})); //end module
//# sourceMappingURL=Navbarcontroller.js.map