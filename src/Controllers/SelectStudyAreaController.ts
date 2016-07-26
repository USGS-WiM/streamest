//------------------------------------------------------------------------------
//----- SelectStudyAreaController ----------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//07.12.2016 jkn - Created

//Import

module StreamEst.Controllers {
    'use string';
    interface ISelectStudyAreaControllerScope extends ng.IScope {
        vm: ISelectStudyAreaController;
    }

    
    interface ISelectStudyAreaController {
    }

    class SelectStudyAreaController implements ISelectStudyAreaController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-        
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;        
        private studyAreaService: Services.IStudyAreaService;   
        private eventManager: WiM.Event.IEventManager;
        private selectedStudyAreaType: Models.StudyAreaType;
        public get displayMessage(): string {
            if (this.selectedStudyAreaType == Models.StudyAreaType.e_basin)
                return "A study area cannot be found. Please zoom into at least a zoom level of 15 and select on a blue stream grid to create a pourpoint to delineate."
            if (this.selectedStudyAreaType == Models.StudyAreaType.e_segment)
                return "A study area cannot be found. Please select one or more blue stream segment to continue."

        }  
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance', 'WiM.Event.EventManager','StreamEst.Services.StudyAreaService' ];
        constructor($scope: ISelectStudyAreaControllerScope, modal:ng.ui.bootstrap.IModalServiceInstance, eventmanager:WiM.Event.IEventManager,saService:Services.IStudyAreaService) {
            $scope.vm = this;
            this.modalInstance = modal;
            this.studyAreaService = saService;
            this.eventManager = eventmanager;
            this.init();
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public OK(): void {
            var eventarg = new Services.StudyAreaEventArgs();
            eventarg.studyArea = this.studyAreaService.getStudyArea(this.selectedStudyAreaType);
            this.eventManager.RaiseEvent(Services.onStudyAreaDoInit,this,eventarg)
            //close modal
            this.modalInstance.dismiss('cancel')
        }
        public Cancel(): void {
            //delete studyarea
            this.studyAreaService.removeStudyArea(this.selectedStudyAreaType)
            this.modalInstance.dismiss('cancel')
        }        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in about controller");
            for (var property in this.studyAreaService.studyAreas) {
                if (this.studyAreaService.studyAreas.hasOwnProperty(property) && this.studyAreaService.studyAreas[property].status == Models.StudyAreaStatus.e_empty) {
                    this.selectedStudyAreaType = property;
                    break;
                }//end if
            }//next property            
        }

      
    }//end  class

    angular.module('StreamEst.Controllers')
        .controller('StreamEst.Controllers.SelectStudyAreaController', SelectStudyAreaController);
}//end module 