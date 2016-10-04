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
var StreamEst;
(function (StreamEst) {
    var Models;
    (function (Models) {
        var FDCTMScenario = (function () {
            function FDCTMScenario() {
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
                ];
                this.Disclaimers = {};
            }
            Object.defineProperty(FDCTMScenario.prototype, "name", {
                //Properties
                get: function () {
                    return "Flow Duration Curve Transfer Method";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FDCTMScenario.prototype, "code", {
                get: function () {
                    return "FDCTM";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FDCTMScenario.prototype, "hint", {
                get: function () {
                    return "QPPQ method";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FDCTMScenario.prototype, "type", {
                get: function () {
                    return ScenarioType.e_statistic;
                },
                enumerable: true,
                configurable: true
            });
            return FDCTMScenario;
        }());
        Models.FDCTMScenario = FDCTMScenario;
        var FAScenario = (function () {
            function FAScenario() {
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
                            "max": 4310.0,
                            "min": 34.3
                        }
                    }
                ];
                this.Disclaimers = {};
                this.result = {};
            }
            Object.defineProperty(FAScenario.prototype, "name", {
                //Properties
                get: function () {
                    return "Flow Anywhere";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FAScenario.prototype, "code", {
                get: function () {
                    return "FLA";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FAScenario.prototype, "hint", {
                get: function () {
                    return "Modified drainage area method";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FAScenario.prototype, "type", {
                get: function () {
                    return ScenarioType.e_statistic;
                },
                enumerable: true,
                configurable: true
            });
            return FAScenario;
        }());
        Models.FAScenario = FAScenario;
        var PRMSScenario = (function () {
            function PRMSScenario() {
                this.status = ScenarioStatus.e_initialized;
                this.SelectedSegmentList = [];
                this.Disclaimers = {};
                this.result = {};
            }
            Object.defineProperty(PRMSScenario.prototype, "name", {
                //Properties
                get: function () {
                    return "Precipitation-Runoff Modeling System";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PRMSScenario.prototype, "code", {
                get: function () {
                    return "PRMS";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PRMSScenario.prototype, "hint", {
                get: function () {
                    return "PRMS method";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PRMSScenario.prototype, "type", {
                get: function () {
                    return ScenarioType.e_physical;
                },
                enumerable: true,
                configurable: true
            });
            return PRMSScenario;
        }());
        Models.PRMSScenario = PRMSScenario; //end class
        (function (ScenarioType) {
            ScenarioType[ScenarioType["e_statistic"] = 1] = "e_statistic";
            ScenarioType[ScenarioType["e_physical"] = 2] = "e_physical";
        })(Models.ScenarioType || (Models.ScenarioType = {}));
        var ScenarioType = Models.ScenarioType;
        (function (ScenarioStatus) {
            ScenarioStatus[ScenarioStatus["e_initialized"] = 0] = "e_initialized";
            ScenarioStatus[ScenarioStatus["e_loaded"] = 9] = "e_loaded";
            ScenarioStatus[ScenarioStatus["e_complete"] = 10] = "e_complete";
            ScenarioStatus[ScenarioStatus["e_error"] = -1] = "e_error";
        })(Models.ScenarioStatus || (Models.ScenarioStatus = {}));
        var ScenarioStatus = Models.ScenarioStatus;
    })(Models = StreamEst.Models || (StreamEst.Models = {}));
})(StreamEst || (StreamEst = {})); //end module 
//# sourceMappingURL=Scenario.js.map