//------------------------------------------------------------------------------
//----- Point ------------------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2014 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//
//Comments
//08.20.2014 jkn - Created
//Imports"
// Interface
var StreamEst;
(function (StreamEst) {
    var Models;
    (function (Models) {
        var WatershedEditDecisionList = (function () {
            function WatershedEditDecisionList() {
                this.append = [];
                this.remove = [];
            }
            return WatershedEditDecisionList;
        }());
        Models.WatershedEditDecisionList = WatershedEditDecisionList; //end class
    })(Models = StreamEst.Models || (StreamEst.Models = {}));
})(StreamEst || (StreamEst = {})); //end module 
//# sourceMappingURL=WatershedEDL.js.map