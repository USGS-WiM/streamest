//------------------------------------------------------------------------------
//----- Scenario ---------------------------------------------------------------
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
//08.20.2014 jkn - Created


//Imports"
// Interface
module StreamEst.Models {
    export interface IScenario {
        name: string;
        code: string;
        hint: string;
        startDate: Date;
        endDate: Date;
        type: ScenarioType;
        status: ScenarioStatus;
        Disclaimers: Object;
        result: Object;
    }
    export class FDCTMScenario implements IScenario {
        //Properties
        public get name(): string {
            return "Flow Duration Curve Transfer Method";
        }
        public get code(): string {
            return "FDCTM";
        }
        public get hint(): string {
            return "QPPQ method";
        }
        public get type():ScenarioType {
            return ScenarioType.e_statistic;
        }
        public Disclaimers: Object;
        public Parameters: Array<Models.IParameter>;
        public SelectedReferenceGage: IReferenceGage;
        public ReferenceGageList: Array<IReferenceGage>;
        public status: ScenarioStatus;
        public result: Object;
        public startDate: Date;
        public endDate: Date;

        public constructor() {
            this.status = ScenarioStatus.e_initialized;
            this.SelectedReferenceGage = null;
            this.ReferenceGageList = [];
            this.Parameters = [
                {
                    "name": "Drainage Area",
                    "description": "Area in square miles",
                    "code": "drnarea",
                    "unit": "square miles",
                    "value": null,
                    "limits": {
                        "max": 7782.0,
                        "min": 15.5
                    }
                },
                {
                    "name": "Mean Annual Precip",
                    "description": "Mean Annual Precipitation",
                    "code": "precip",
                    "unit": "inch",
                    "value": null,
                    "limits": {
                        "max": 38.8,
                        "min": 27.7
                    }
                },
                {
                    "name": "Relative Stream Density",
                    "description": "(First Order Streams * DRNAREA / sum of Stream Lengths ^2)",
                    "code": "rsd",
                    "unit": "",
                    "value": null,
                    "limits": {
                        "max": 0.49,
                        "min": 0.22
                    }
                },
                {
                    "name": "Hydrograph Separation Analysis",
                    "description": "Percent of area covered by Hydrograph Separation",
                    "code": "hysep",
                    "unit": "percent",
                    "value": null,
                    "limits": {
                        "max": 78.0,
                        "min": 20.3
                    }
                },
                {
                    "name": "Stream Variability Index",
                    "description": "Streamflow Variability Index",
                    "code": "stream_varg",
                    "unit": "",
                    "value": null,
                    "limits": {
                        "max": 0.76,
                        "min": 0.21
                    }
                },
                {
                    "name": "Percent Area Soil Type B",
                    "description": "Percent of area in hydric soil 'B' defined by SSURGO",
                    "code": "SSURGOB",
                    "unit": "percent area",
                    "value": null,
                    "limits": {
                        "max": 99.4,
                        "min": 5.7
                    }
                },
                {
                    "name": "Percent Area Soil Type C",
                    "description": "Percent of area in hydric soil 'C' defined by SSURGO",
                    "code": "SSURGOC",
                    "unit": "percent area",
                    "value": null,
                    "limits": {
                        "max": 83.5,
                        "min": 0.09
                    }
                },
                {
                    "name": "Percent Area Soil Type D",
                    "description": "Percent of area in hydric soil 'D' defined by SSURGO",
                    "code": "SSURGOD",
                    "unit": "percent area",
                    "value": null,
                    "limits": {
                        "max": 57.0,
                        "min": 0.0
                    }
                }
            ]
            this.Disclaimers = {};
        }
    }

    export class FAScenario implements IScenario {
        //Properties
        public get name(): string {
            return "Flow Anywhere";
        }
        public get code(): string {
            return "FLA";
        }
        public get hint(): string {
            return "Modified drainage area method";
        }
        public get type(): ScenarioType {
            return ScenarioType.e_statistic;
        }
        public Parameters: Array<Models.IParameter>;
        public regionID: number;
        public Disclaimers: Object;
        public SelectedReferenceGage: IReferenceGage;
        public ReferenceGageList: Array<IReferenceGage>;
        public status: ScenarioStatus;
        public result: Object;
        public startDate: Date;
        public endDate: Date;

        public constructor() {
            this.status = ScenarioStatus.e_initialized;
            this.SelectedReferenceGage = null;
            this.ReferenceGageList = [];
            this.Parameters = [
                {
                    "name": "Drainage Area",
                    "description":"Area in square miles",
                    "code": "drnarea",
                    "unit": "square miles",
                    "value": null,
                    "limits": {
                        "max": 4310.0,
                        "min": 34.3
                    }
                }
            ]
            this.Disclaimers = {};
            this.result = {};
        }
    }

    export class PRMSScenario implements IScenario {
        //Properties
        public get name(): string {
            return "Precipitation-Runoff Modeling System";
        }
        public get code(): string {
            return "PRMS";
        }
        public get hint(): string {
            return "PRMS method";
        }
        public get type(): ScenarioType {
            return ScenarioType.e_physical;
        }
        public Disclaimers: Object;
        public SelectedSegmentList: Array<Models.IPRMSSegment>;
        public status: ScenarioStatus;
        public result: Object;
        public startDate: Date;
        public endDate: Date;

        public constructor() {
            this.status = ScenarioStatus.e_initialized;
            this.SelectedSegmentList = [];
            this.Disclaimers = {};
            this.result = {};
        }
    }//end class
    export interface IPRMSSegment {
        SegmentID: Number;
        RiverID: string;
        feature: any;
    }
    export enum ScenarioType {
        e_statistic = 1,
        e_physical = 2
    }
    export enum ScenarioStatus {
        e_initialized = 0,
        e_loaded =9,
        e_complete = 10,
        e_error = -1
    }

    
}//end module 