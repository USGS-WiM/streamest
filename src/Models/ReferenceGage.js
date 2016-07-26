//------------------------------------------------------------------------------
//----- ReferenceGage ----------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Capture and hold users session information
//          
//discussion:
//
//Comments
//07.20.2016 jkn - Created
//Imports"
// Interface
var StreamEst;
(function (StreamEst) {
    var Models;
    (function (Models) {
        var ReferenceGage = (function () {
            // Constructor
            function ReferenceGage(id, name) {
                this.StationID = id;
                this.Name = name;
            } //end constructor 
            return ReferenceGage;
        })();
        Models.ReferenceGage = ReferenceGage; //end class
    })(Models = StreamEst.Models || (StreamEst.Models = {}));
})(StreamEst || (StreamEst = {})); //end module  
//# sourceMappingURL=ReferenceGage.js.map