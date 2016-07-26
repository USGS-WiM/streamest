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
        var StudyArea = (function () {
            function StudyArea(region, point) {
                if (region === void 0) { region = ""; }
                if (point === void 0) { point = null; }
                this.RegionID = region;
                this.Pourpoint = point;
                this.Scenarios = [];
                this.Features = [];
                this.computedParametersList = [];
                this.Disclaimers = {};
                if (this.RegionID == '' || this.Pourpoint == null)
                    this.status = StudyAreaStatus.e_empty;
                else
                    this.status = StudyAreaStatus.e_initialized;
            }
            Object.defineProperty(StudyArea.prototype, "studyAreaType", {
                get: function () {
                    return StudyAreaType.e_basin;
                },
                enumerable: true,
                configurable: true
            });
            return StudyArea;
        })();
        Models.StudyArea = StudyArea; //end class
        var SegmentStudyArea = (function () {
            function SegmentStudyArea(RiverName, segID) {
                if (RiverName === void 0) { RiverName = ""; }
                if (segID === void 0) { segID = -1; }
                this.CreatedDate = new Date();
                this.Disclaimers = {};
                this.Scenarios = [];
                this.Features = [];
                this.status = StudyAreaStatus.e_empty;
            }
            Object.defineProperty(SegmentStudyArea.prototype, "studyAreaType", {
                //properties
                get: function () {
                    return StudyAreaType.e_segment;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SegmentStudyArea.prototype, "Features", {
                get: function () {
                    var featurelist = [];
                    for (var i = 0; i < this.Scenarios.length; i++) {
                        for (var j = 0; j < this.Scenarios[i].SelectedSegmentList.length; j++) {
                            featurelist.push({ name: "PRMS_seg_" + i + "." + j, feature: this.Scenarios[i].SelectedSegmentList[j].feature });
                        } //next j
                    } //next i
                    return featurelist;
                },
                enumerable: true,
                configurable: true
            });
            return SegmentStudyArea;
        })();
        Models.SegmentStudyArea = SegmentStudyArea; //end class
        (function (StudyAreaType) {
            StudyAreaType[StudyAreaType["e_segment"] = 1] = "e_segment";
            StudyAreaType[StudyAreaType["e_basin"] = 2] = "e_basin";
        })(Models.StudyAreaType || (Models.StudyAreaType = {}));
        var StudyAreaType = Models.StudyAreaType;
        (function (StudyAreaStatus) {
            StudyAreaStatus[StudyAreaStatus["e_empty"] = 0] = "e_empty";
            StudyAreaStatus[StudyAreaStatus["e_initialized"] = 1] = "e_initialized";
            StudyAreaStatus[StudyAreaStatus["e_ready"] = 2] = "e_ready";
            StudyAreaStatus[StudyAreaStatus["e_error"] = 3] = "e_error";
        })(Models.StudyAreaStatus || (Models.StudyAreaStatus = {}));
        var StudyAreaStatus = Models.StudyAreaStatus;
    })(Models = StreamEst.Models || (StreamEst.Models = {}));
})(StreamEst || (StreamEst = {})); //end module 
//# sourceMappingURL=StudyArea.js.map