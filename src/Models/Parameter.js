//------------------------------------------------------------------------------
//----- Parameter --------------------------------------------------------------
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
//07.18.2016 jkn - Created
//Imports"
// Interface
var StreamEst;
(function (StreamEst) {
    var Models;
    (function (Models) {
        var Parameter = (function () {
            // Constructor
            function Parameter(nm, c, desc, unit, val) {
                if (nm === void 0) { nm = ""; }
                if (c === void 0) { c = ""; }
                if (desc === void 0) { desc = ""; }
                if (unit === void 0) { unit = ""; }
                if (val === void 0) { val = NaN; }
                this.name = nm;
                this.code = c;
                this.description = desc;
                this.unit = unit;
                this.value = val;
            } //end constructor
            return Parameter;
        })();
        Models.Parameter = Parameter; //end class
    })(Models = StreamEst.Models || (StreamEst.Models = {}));
})(StreamEst || (StreamEst = {})); //end module   
//# sourceMappingURL=Parameter.js.map