//------------------------------------------------------------------------------
//----- About ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Martyn J. Smith USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//03.07.2016 mjs - Created

//Import

module StreamEst.Controllers {
    'use string';
    interface IAboutControllerScope extends ng.IScope {
        vm: IAboutController;
    }

    interface IModal {
        Close():void
    }
    
    interface IAboutController extends IModal {
    }

    class AboutController implements IAboutController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private StudyArea: StreamEst.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public selectedAboutTabName: string;
        public citations: Array<Models.ICitation>;



        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope','$modalInstance','StreamEst.Services.ModalService'];
        constructor($scope: IAboutControllerScope, modal:ng.ui.bootstrap.IModalServiceInstance,modalservice:Services.IModalService) {
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalservice;
            this.citations = [];
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalService.modalOptions = null;
            this.modalInstance.dismiss('cancel')
        }

        public selectAboutTab(tabname: string): void {
            if (this.selectedAboutTabName == tabname) return;
            this.selectedAboutTabName = tabname;
        }
        public openCitationLink(citation:Models.ICitation) {
            window.open(citation.src, '_blank');
        }

        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            if (this.modalService.modalOptions != null && this.modalService.modalOptions.tabName !='') this.selectAboutTab(this.modalService.modalOptions.tabName);
            else this.selectedAboutTabName = "about";

            this.LoadCitations();
        }
        private LoadCitations() {

            this.citations = Citations;

        }

      
    }//end  class

    angular.module('StreamEst.Controllers')
        .controller('StreamEst.Controllers.AboutController', AboutController);
}//end module 