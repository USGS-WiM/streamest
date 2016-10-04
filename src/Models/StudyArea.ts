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
module StreamEst.Models {
    export interface IStudyArea {
        Disclaimers: Object;
        studyAreaType: StudyAreaType;
        Features: Array<any>;
        Description: string;
        CreatedDate: Date;
        Scenarios: Array<IScenario>
        status: StudyAreaStatus
    }

    export interface ISegmentStudyArea extends IStudyArea {
        
    }
    export interface IStatisticStudyArea extends IStudyArea {
        RegionID: string;
        Pourpoint: WiM.Models.IPoint;        
        WorkspaceID: string;
        computedParametersList: Array<IParameter>;
    }

    export class StudyArea implements IStatisticStudyArea {
        //properties
        public RegionID: string;
        public Pourpoint: WiM.Models.IPoint;
        public Description: string;
        public get studyAreaType(): StudyAreaType {
            return StudyAreaType.e_basin;
        }        
        public Features: Array<any>;
        public WorkspaceID: string;
        public CreatedDate: Date;
        public Disclaimers: Object;
        public Scenarios: Array<IScenario>;
        public status: StudyAreaStatus
        public computedParametersList: Array<IParameter>;

        constructor(region: string ="", point: WiM.Models.IPoint =null) {
            this.RegionID = region;
            this.Pourpoint = point;
            this.Scenarios = [];
            this.Features = [];
            this.computedParametersList = [];
            this.Disclaimers = {};
            if (this.RegionID == '' || this.Pourpoint == null)
                this.status = StudyAreaStatus.e_empty;
            else this.status = StudyAreaStatus.e_initialized;
        }
    }//end class

    export class SegmentStudyArea implements ISegmentStudyArea {
        //properties
        public get studyAreaType(): StudyAreaType {
            return StudyAreaType.e_segment;
        }
        public Disclaimers: Object;
        public get Features(): Array<any> {
            var featurelist: Array<any> = [];
            for (var i = 0; i<this.Scenarios.length; i++) {
                for (var j = 0; j<this.Scenarios[i].SelectedSegmentList.length; j++) {
                    var seg = this.Scenarios[i].SelectedSegmentList[j];
                    featurelist.push({ name: "PRMSSeg_"+seg.RiverID+"."+seg.SegmentID, feature: seg.feature });
                }//next j
            }//next i
            return featurelist;
        }
        public Description: string;
        public selectPath: Array<any>;
        public CreatedDate: Date;
        public Scenarios: Array<Models.PRMSScenario>
        public status: StudyAreaStatus

        constructor(RiverName: string ="", segID: Number=-1) {

            this.CreatedDate = new Date();
            this.Disclaimers = {};
            this.Scenarios = [];
            this.status = StudyAreaStatus.e_empty;
        }
    }//end class
    
    export enum StudyAreaType {
        e_basin = 1,
        e_segment = 2
        
    }
    export enum StudyAreaStatus {
        e_empty = 0,
        e_initialized = 1,
        e_ready = 2,
        e_error=-1
    }

}//end module 