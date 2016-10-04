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
var StreamEst;
(function (StreamEst) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var AboutController = (function () {
            function AboutController($scope, modal, modalservice) {
                $scope.vm = this;
                this.modalInstance = modal;
                this.modalService = modalservice;
                this.citations = [];
                this.init();
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.prototype.Close = function () {
                this.modalService.modalOptions = null;
                this.modalInstance.dismiss('cancel');
            };
            AboutController.prototype.selectAboutTab = function (tabname) {
                if (this.selectedAboutTabName == tabname)
                    return;
                this.selectedAboutTabName = tabname;
            };
            AboutController.prototype.openCitationLink = function (citation) {
                window.open(citation.src, '_blank');
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.prototype.init = function () {
                if (this.modalService.modalOptions != null && this.modalService.modalOptions.tabName != '')
                    this.selectAboutTab(this.modalService.modalOptions.tabName);
                else
                    this.selectedAboutTabName = "about";
                this.LoadCitations();
            };
            AboutController.prototype.LoadCitations = function () {
                this.citations = Citations;
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.$inject = ['$scope', '$modalInstance', 'StreamEst.Services.ModalService'];
            return AboutController;
        }()); //end  class
        angular.module('StreamEst.Controllers')
            .controller('StreamEst.Controllers.AboutController', AboutController);
    })(Controllers = StreamEst.Controllers || (StreamEst.Controllers = {}));
})(StreamEst || (StreamEst = {})); //end module 
//# sourceMappingURL=AboutController.js.map