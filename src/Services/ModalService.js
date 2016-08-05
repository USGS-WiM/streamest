//------------------------------------------------------------------------------
//----- modalService -----------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//06.16.2015 mjs - Created
//Import
var StreamEst;
(function (StreamEst) {
    var Services;
    (function (Services) {
        'use strict';
        var ModalService = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function ModalService($modal, toaster) {
                this.toaster = toaster;
                this.modal = $modal;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ModalService.prototype.openModal = function (mType, options) {
                if (options === void 0) { options = null; }
                this.modalOptions = options;
                this.modal.open(this.getModalSettings(mType));
                this.toaster.pop("info", "open...", 10000);
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ModalService.prototype.getModalSettings = function (mType) {
                //console.log('in canUpdateProcedure');
                //Project flow:
                var msg;
                try {
                    switch (mType) {
                        case SSModalType.e_report:
                            return {
                                templateUrl: 'Views/reportview.html',
                                controller: 'StreamEst.Controllers.ReportController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_about:
                            return {
                                templateUrl: 'Views/about.html',
                                controller: 'StreamEst.Controllers.AboutController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_selectstudyarea:
                            return {
                                templateUrl: 'Views/selectstudyareaview.html',
                                controller: 'StreamEst.Controllers.SelectStudyAreaController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        default:
                            return false;
                    } //end switch          
                }
                catch (e) {
                    //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                    return false;
                }
            };
            return ModalService;
        })(); //end class
        (function (SSModalType) {
            SSModalType[SSModalType["e_report"] = 1] = "e_report";
            SSModalType[SSModalType["e_about"] = 2] = "e_about";
            SSModalType[SSModalType["e_selectstudyarea"] = 3] = "e_selectstudyarea";
        })(Services.SSModalType || (Services.SSModalType = {}));
        var SSModalType = Services.SSModalType;
        factory.$inject = ['$modal', 'toaster'];
        function factory($modal, toaster) {
            return new ModalService($modal, toaster);
        }
        angular.module('StreamEst.Services')
            .factory('StreamEst.Services.ModalService', factory);
    })(Services = StreamEst.Services || (StreamEst.Services = {}));
})(StreamEst || (StreamEst = {})); //end module  
//# sourceMappingURL=ModalService.js.map