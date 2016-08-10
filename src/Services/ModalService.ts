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
module StreamEst.Services {
    'use strict'
    export interface IModalService {
        openModal(mType: SSModalType, options?: IModalOptions);
        modalOptions: IModalOptions;
    }

    export interface IModalOptions {
        tabName?: string;
        regionID?: string;
        editable?: boolean;
    }

    class ModalService implements IModalService{       
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public modal: ng.ui.bootstrap.IModalService;
        public modalOptions: IModalOptions;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($modal: ng.ui.bootstrap.IModalService) {
            this.modal = $modal;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public openModal(mType: SSModalType, options: IModalOptions = null) {            
            this.modalOptions = options
            this.modal.open(this.getModalSettings(mType));
        }  


        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private getModalSettings(mType: SSModalType): ng.ui.bootstrap.IModalSettings {
            //console.log('in canUpdateProcedure');
            //Project flow:
            var msg: string;
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
                }//end switch          
            }
            catch (e) {
                //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                return false;
            }
        }

    }//end class
    export enum SSModalType {
        e_report = 1,
        e_about = 2,
        e_selectstudyarea =3
        
    }

    factory.$inject = ['$modal'];
    function factory($modal: ng.ui.bootstrap.IModalService) {
        return new ModalService($modal)
    }
    angular.module('StreamEst.Services')
        .factory('StreamEst.Services.ModalService', factory)
}//end module  