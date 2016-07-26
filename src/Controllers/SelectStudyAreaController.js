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
var StreamEst;
(function (StreamEst) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var SelectStudyAreaController = (function () {
            function SelectStudyAreaController($scope, modal, eventmanager, saService) {
                $scope.vm = this;
                this.modalInstance = modal;
                this.studyAreaService = saService;
                this.eventManager = eventmanager;
                this.init();
            }
            Object.defineProperty(SelectStudyAreaController.prototype, "displayMessage", {
                get: function () {
                    if (this.selectedStudyAreaType == StreamEst.Models.StudyAreaType.e_basin)
                        return "A study area cannot be found. Please zoom into at least a zoom level of 15 and select on a blue stream grid to create a pourpoint to delineate.";
                    if (this.selectedStudyAreaType == StreamEst.Models.StudyAreaType.e_segment)
                        return "A study area cannot be found. Please select one or more blue stream segment to continue.";
                },
                enumerable: true,
                configurable: true
            });
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            SelectStudyAreaController.prototype.OK = function () {
                var eventarg = new StreamEst.Services.StudyAreaEventArgs();
                eventarg.studyArea = this.studyAreaService.getStudyArea(this.selectedStudyAreaType);
                this.eventManager.RaiseEvent(StreamEst.Services.onStudyAreaDoInit, this, eventarg);
                //close modal
                this.modalInstance.dismiss('cancel');
            };
            SelectStudyAreaController.prototype.Cancel = function () {
                //delete studyarea
                this.studyAreaService.removeStudyArea(this.selectedStudyAreaType);
                this.modalInstance.dismiss('cancel');
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SelectStudyAreaController.prototype.init = function () {
                //console.log("in about controller");
                for (var property in this.studyAreaService.studyAreas) {
                    if (this.studyAreaService.studyAreas.hasOwnProperty(property) && this.studyAreaService.studyAreas[property].status == StreamEst.Models.StudyAreaStatus.e_empty) {
                        this.selectedStudyAreaType = property;
                        break;
                    } //end if
                } //next property            
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            SelectStudyAreaController.$inject = ['$scope', '$modalInstance', 'WiM.Event.EventManager', 'StreamEst.Services.StudyAreaService'];
            return SelectStudyAreaController;
        })(); //end  class
        angular.module('StreamEst.Controllers')
            .controller('StreamEst.Controllers.SelectStudyAreaController', SelectStudyAreaController);
    })(Controllers = StreamEst.Controllers || (StreamEst.Controllers = {}));
})(StreamEst || (StreamEst = {})); //end module 
//# sourceMappingURL=SelectStudyAreaController.js.map