//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
//
//Comments
//04.15.2015 jkn - Created
//Import
var StreamEst;
(function (StreamEst) {
    var Services;
    (function (Services) {
        'use strict';
        Services.onSelectedStudyAreaChanged = "onSelectedStudyAreaChanged";
        Services.onStudyAreaDoInit = "onStudyAreaDoInit";
        Services.onStudyAreaLoadComplete = "onStudyAreaLoadComplete";
        Services.onStudyAreaRemoved = "onStudyAreaRemoved";
        Services.onStudyAreaExcecuteComplete = "onStudyAreaExcecuteComplete";
        var StudyAreaEventArgs = (function (_super) {
            __extends(StudyAreaEventArgs, _super);
            function StudyAreaEventArgs() {
                _super.call(this);
            }
            return StudyAreaEventArgs;
        })(WiM.Event.EventArgs);
        Services.StudyAreaEventArgs = StudyAreaEventArgs;
        var StudyAreaService = (function (_super) {
            __extends(StudyAreaService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StudyAreaService($http, eventManager, modal) {
                _super.call(this, $http, configuration.baseurls['StreamStats']);
                this.$http = $http;
                this._busyCount = 0;
                //Dictionaries
                //-+-+-+-+-+-+-+-+-+-+-+-
                this._studyAreas = {};
                this.eventmanager = eventManager;
                this.modalservice = modal;
                this.init();
                eventManager.AddEvent(Services.onSelectedStudyAreaChanged);
                eventManager.AddEvent(Services.onStudyAreaRemoved);
                eventManager.AddEvent(Services.onStudyAreaLoadComplete);
                eventManager.AddEvent(Services.onStudyAreaExcecuteComplete);
            }
            Object.defineProperty(StudyAreaService.prototype, "isBusy", {
                get: function () {
                    if (this._busyCount > 0) {
                        return true;
                    }
                    this._busyCount = 0;
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "studyAreas", {
                get: function () {
                    return this._studyAreas;
                },
                enumerable: true,
                configurable: true
            });
            StudyAreaService.prototype.addStudyArea = function (key, sa) {
                if (this.containsStudyArea(key))
                    return false;
                this._studyAreas[key] = sa;
                return true;
            };
            StudyAreaService.prototype.removeStudyArea = function (key) {
                if (this.containsStudyArea(key))
                    delete this._studyAreas[key];
                return true;
            };
            StudyAreaService.prototype.getStudyArea = function (key) {
                if (this.containsStudyArea(key))
                    return this._studyAreas[key];
                return null;
            };
            StudyAreaService.prototype.containsStudyArea = function (key) {
                if (key in this._studyAreas)
                    return true;
                else
                    return false;
            };
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StudyAreaService.prototype.addScenario = function (scenario) {
                var saType = this.getStudyAreaType(scenario.type);
                var sa = this.getStudyArea(saType);
                if (sa == null)
                    sa = this.addStudyAreaByType(saType);
                sa.Scenarios.push(scenario);
            };
            StudyAreaService.prototype.scenarioExists = function (scenario) {
                var saType = this.getStudyAreaType(scenario.type);
                var sa = this.getStudyArea(saType);
                if (sa == null)
                    return false;
                var index = sa.Scenarios.indexOf(scenario);
                if (index > -1)
                    return true;
                return false;
            };
            StudyAreaService.prototype.removeScenario = function (scenario) {
                var saType = this.getStudyAreaType(scenario.type);
                var sa = this.getStudyArea(saType);
                if (sa == null)
                    return;
                var index = sa.Scenarios.indexOf(scenario);
                if (index < 0)
                    return;
                sa.Scenarios.splice(index, 1);
            };
            StudyAreaService.prototype.initializeStudyArea = function (saType) {
                var _this = this;
                var sa = this.getStudyArea(saType);
                sa.status = StreamEst.Models.StudyAreaStatus.e_initialized;
                switch (saType) {
                    case StreamEst.Models.StudyAreaType.e_basin:
                        var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', sa.RegionID, sa.Pourpoint.Longitude.toString(), sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false);
                        var request = new WiM.Services.Helpers.RequestInfo(url, true);
                        this.Execute(request).then(function (response) {
                            //console.log('delineation response headers: ', response.headers());
                            sa.Disclaimers["Server"] = response.headers()['usgswim-hostname'];
                            if (response.data.hasOwnProperty("messages"))
                                sa.Disclaimers["DelineationMessages"] = response.data.messages;
                            if (response.data.hasOwnProperty("featurecollection")) {
                                //loop through and add to features
                                response.data["featurecollection"].forEach(function (item) {
                                    sa.Features.push(item);
                                });
                                sa.status = StreamEst.Models.StudyAreaStatus.e_ready;
                            } //end if
                            sa.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                            //sm when complete
                        }, function (error) {
                            sa.status = StreamEst.Models.StudyAreaStatus.e_error;
                            sa.Disclaimers["error"] = "Delineation Error";
                        }).finally(function () {
                            var eventArgs = new StudyAreaEventArgs();
                            eventArgs.studyArea = sa;
                            _this.eventmanager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, eventArgs);
                        });
                        break;
                    case StreamEst.Models.StudyAreaType.e_segment:
                        break;
                } //end switch
            };
            StudyAreaService.prototype.loadStudyArea = function (workspaceID) {
                var _this = this;
                try {
                    var sa = new StreamEst.Models.StudyArea();
                    sa.status = StreamEst.Models.StudyAreaStatus.e_initialized;
                    this.addStudyArea(sa.studyAreaType, sa);
                    switch (sa.studyAreaType) {
                        case StreamEst.Models.StudyAreaType.e_basin:
                            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSwatershedByWorkspace'].format('geojson', "IA", workspaceID, 4326);
                            var request = new WiM.Services.Helpers.RequestInfo(url, true);
                            this.Execute(request).then(function (response) {
                                sa.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                                sa.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                                sa.RegionID = 'IA',
                                    sa.CreatedDate = new Date();
                                //set point
                                sa.Features.forEach(function (layer) {
                                    var item = angular.fromJson(angular.toJson(layer));
                                    if (item.name == 'globalwatershedpoint') {
                                        //get and set geometry
                                        var geom = item.feature.features[0].bbox;
                                        sa.Pourpoint = new WiM.Models.Point(geom[1], geom[0], item.feature.crs.properties.code);
                                        return;
                                    } //end if
                                });
                                sa.status = StreamEst.Models.StudyAreaStatus.e_ready;
                                //sm when complete
                            }, function (error) {
                                //sm when error
                                sa.status = StreamEst.Models.StudyAreaStatus.e_error;
                                sa.Disclaimers["error"] = "Delineation Error";
                            }).finally(function () {
                                var eventArgs = new StudyAreaEventArgs();
                                eventArgs.studyArea = sa;
                                _this.eventmanager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, eventArgs);
                            });
                            break;
                    } //end switch             
                }
                catch (err) {
                    return;
                }
            };
            StudyAreaService.prototype.getstudyAreaFeatures = function (LayerName) {
                var features = [];
                for (var property in this.studyAreas) {
                    if (this.studyAreas.hasOwnProperty(property) && this.studyAreas[property].Features.length > 0) {
                        for (var i = 0; i < this.studyAreas[property].Features.length; i++) {
                            if (this.studyAreas[property].Features[i].name == LayerName)
                                features.push(this.studyAreas[property].Features[i]);
                        } //next i                   
                    } //end if
                } //next property            
                return features;
            };
            StudyAreaService.prototype.loadScenarios = function () {
                if (this.isBusy)
                    return;
                //gets the parameters required for this scenario
                var sa = this.studyAreas;
                if (Object.keys(sa).length === 0)
                    return;
                for (var key in sa) {
                    if (sa[key].status != StreamEst.Models.StudyAreaStatus.e_ready)
                        return;
                    if (sa[key].studyAreaType == StreamEst.Models.StudyAreaType.e_basin)
                        this.loadParameters(sa[key]);
                    if (sa[key].studyAreaType == StreamEst.Models.StudyAreaType.e_basin)
                        this.loadReferenceGage(sa[key]);
                    if (sa[key].studyAreaType == StreamEst.Models.StudyAreaType.e_segment && !this.isBusy)
                        this.eventmanager.RaiseEvent(Services.onStudyAreaLoadComplete, this, StudyAreaEventArgs.Empty);
                }
                ; //next sa
            };
            StudyAreaService.prototype.verifyScenariosStatus = function (status) {
                var sa = this.studyAreas;
                if (Object.keys(sa).length === 0)
                    return;
                for (var key in sa) {
                    if (sa[key].status != StreamEst.Models.StudyAreaStatus.e_ready)
                        return false;
                    sa[key].Scenarios.forEach(function (scenario) {
                        if (status == StreamEst.Models.ScenarioStatus.e_loaded &&
                            (scenario.status <= StreamEst.Models.ScenarioStatus.e_initialized || scenario.status == StreamEst.Models.ScenarioStatus.e_error))
                            return false;
                        else if (status != scenario.status)
                            return false;
                    }); //next scenario
                }
                ; //next sa
                return true;
            };
            StudyAreaService.prototype.computeScenarios = function (startDate, endDate) {
                var _this = this;
                if (this.isBusy)
                    return;
                var sa = this.studyAreas;
                if (Object.keys(sa).length === 0)
                    return;
                for (var key in sa) {
                    if (sa[key].status != StreamEst.Models.StudyAreaStatus.e_ready)
                        return;
                    sa[key].Scenarios.forEach(function (scenario) {
                        scenario.startDate = startDate;
                        scenario.endDate = endDate;
                        if (scenario.code == "FDCTM" || scenario.code == "FLA")
                            _this.computeScenario(scenario);
                        if (scenario.code == "PRMS")
                            _this.computePRMSScenario(scenario);
                    }); //next scenario
                }
                ; //next sa
            };
            StudyAreaService.prototype.refreshParameter = function (parameter) {
                //get all params for scenario
                var sa = this.getStudyArea(StreamEst.Models.StudyAreaType.e_basin);
                var Paramindex = sa.computedParametersList.indexOf(parameter);
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(sa.RegionID, sa.WorkspaceID, parameter.code);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log('delineation response headers: ', response.headers());                    
                    if (response.data.hasOwnProperty("messages"))
                        sa.Disclaimers["ParameterMessages"] = response.data.messages;
                    if (response.data.hasOwnProperty("parameters")) {
                        //load sa
                        var responsevalue = response.data.parameters.map(function (rParam) { return new StreamEst.Models.Parameter(rParam.name, rParam.code, rParam.description, rParam.unit, rParam.value); });
                        if (Paramindex < 0)
                            return;
                        sa.computedParametersList[Paramindex].value = responsevalue[0].value;
                        sa.computedParametersList[Paramindex]['isbusy'] = false;
                        sa.Scenarios.forEach(function (scenario) {
                            if (scenario.hasOwnProperty("Parameters")) {
                                for (var p = 0; p < scenario["Parameters"].length; p++) {
                                    var param = scenario["Parameters"][p];
                                    for (var i = 0; i < response.data.parameters.length; i++) {
                                        var pr = response.data.parameters[i];
                                        if (pr.code.toUpperCase() === param.code.toUpperCase()) {
                                            param.value = pr.value;
                                            break;
                                        } //end if
                                    } //next i
                                }
                                ; //next p
                            } //end if                           
                        }); //next scenario
                    } //end if 
                    //sm when complete
                }, function (error) {
                    sa.status = StreamEst.Models.StudyAreaStatus.e_error;
                    sa.Disclaimers["error"] = "Delineation Error";
                }).finally(function () {
                });
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+- 
            StudyAreaService.prototype.init = function () {
                this.loadPRMSNameLookup();
            };
            StudyAreaService.prototype.addStudyAreaByType = function (saType) {
                var result;
                switch (saType) {
                    case StreamEst.Models.StudyAreaType.e_basin:
                        result = new StreamEst.Models.StudyArea();
                        break;
                    case StreamEst.Models.StudyAreaType.e_segment:
                        result = new StreamEst.Models.SegmentStudyArea();
                        break;
                } //end switch
                this.modalservice.openModal(Services.SSModalType.e_selectstudyarea);
                this.addStudyArea(saType, result);
                return result;
            };
            StudyAreaService.prototype.getStudyAreaType = function (scenarioType) {
                switch (scenarioType) {
                    case 1:
                        return StreamEst.Models.StudyAreaType.e_basin;
                    case 2:
                        return StreamEst.Models.StudyAreaType.e_segment;
                    default:
                        return null;
                } //end swtich
            };
            StudyAreaService.prototype.loadParameters = function (sa) {
                var _this = this;
                this._busyCount++;
                //get all params for scenario
                var paramcodes = [];
                sa.Scenarios.forEach(function (item) { if (item.hasOwnProperty("Parameters"))
                    item["Parameters"].map(function (m) { if (paramcodes.indexOf(m.code) < 0)
                        paramcodes.push(m.code); }); });
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(sa.RegionID, sa.WorkspaceID, paramcodes.join(';'));
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log('delineation response headers: ', response.headers());                    
                    if (response.data.hasOwnProperty("messages"))
                        sa.Disclaimers["ParameterMessages"] = response.data.messages;
                    if (response.data.hasOwnProperty("parameters")) {
                        //load sa
                        sa.computedParametersList = response.data.parameters.map(function (rParam) { return new StreamEst.Models.Parameter(rParam.name, rParam.code, rParam.description, rParam.unit, rParam.value); });
                        sa.Scenarios.forEach(function (scenario) {
                            if (scenario.hasOwnProperty("Parameters")) {
                                for (var p = 0; p < scenario["Parameters"].length; p++) {
                                    var param = scenario["Parameters"][p];
                                    for (var i = 0; i < response.data.parameters.length; i++) {
                                        var pr = response.data.parameters[i];
                                        if (pr.code.toUpperCase() === param.code.toUpperCase()) {
                                            param.value = pr.value;
                                            break;
                                        } //end if
                                    } //next i
                                }
                                ; //next p
                            } //end if                           
                        }); //next scenario
                    } //end if 
                    //sm when complete
                }, function (error) {
                    sa.status = StreamEst.Models.StudyAreaStatus.e_error;
                    sa.Disclaimers["error"] = "Delineation Error";
                }).finally(function () {
                    //raise event
                    _this._busyCount--;
                    if (!_this.isBusy)
                        _this.eventmanager.RaiseEvent(Services.onStudyAreaLoadComplete, _this, StudyAreaEventArgs.Empty);
                });
            };
            StudyAreaService.prototype.loadReferenceGage = function (sa) {
                //get all params for scenario
                var _this = this;
                var url = "";
                sa.Scenarios.forEach(function (scenario) {
                    _this._busyCount++;
                    if (!scenario.hasOwnProperty("ReferenceGageList") || !scenario.hasOwnProperty("SelectedReferenceGage"))
                        return;
                    switch (scenario.code) {
                        case "FDCTM":
                            url = configuration.baseurls['Service'];
                            url = url + configuration.queryparams['KrigService'].format(sa.RegionID, sa.Pourpoint.Longitude, sa.Pourpoint.Latitude, sa.Pourpoint.crs);
                            break;
                        case "FLA":
                            url = configuration.baseurls['GISserver'];
                            url = url + configuration.queryparams["FARefGage"].format("{" + "x:{0},y:{1}".format(sa.Pourpoint.Longitude.toString(), sa.Pourpoint.Latitude.toString()) + "}", sa.Pourpoint.crs);
                            break;
                    } //end switch                      
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    _this.Execute(request).then(function (response) {
                        //console.log('delineation response headers: ', response.headers());                    
                        var result = response.data;
                        //sm when complete 
                        switch (scenario.code) {
                            case "FDCTM":
                                scenario["ReferenceGageList"] = [];
                                for (var i = 0; i < result.length; i++) {
                                    var gage = new StreamEst.Models.ReferenceGage(result[i].ID, result[i].Name);
                                    gage.DrainageArea_sqMI = result[i].DrainageArea;
                                    gage.correlation = result[i].Correlation;
                                    scenario["ReferenceGageList"].push(gage);
                                    scenario["SelectedReferenceGage"] = scenario["ReferenceGageList"][0];
                                } //next i
                                break;
                            case "FLA":
                                scenario["ReferenceGageList"] = [];
                                for (var i = 0; i < result.features.length; i++) {
                                    var attr = result.features[i].attributes;
                                    var gage = new StreamEst.Models.ReferenceGage(attr["reference_gages.site_id"], attr["reference_gages.site_name"]);
                                    gage.DrainageArea_sqMI = attr["reference_gages.da_gis_mi2"];
                                    scenario["ReferenceGageList"].push(gage);
                                    scenario["SelectedReferenceGage"] = scenario["ReferenceGageList"][0];
                                    scenario["regionID"] = attr["regions_local.Region_Agg"];
                                } //next i
                                break;
                        } //end switch                   
                        scenario.status++;
                    }, function (error) {
                        sa.status = StreamEst.Models.StudyAreaStatus.e_error;
                        sa.Disclaimers["error"] = "Delineation Error";
                    }).finally(function () {
                        //raise event
                        _this._busyCount--;
                        if (!_this.isBusy)
                            _this.eventmanager.RaiseEvent(Services.onStudyAreaLoadComplete, _this, StudyAreaEventArgs.Empty);
                    });
                });
            };
            StudyAreaService.prototype.computeScenario = function (scenario) {
                var _this = this;
                //get all params for scenario
                this._busyCount++;
                var url = "";
                var body = {};
                switch (scenario.code) {
                    case "FDCTM":
                        url = configuration.baseurls['Service'] + configuration.queryparams['RegressionScenarios'].format(scenario.code);
                        body["startdate"] = scenario.startDate;
                        body["enddate"] = scenario.endDate;
                        body["nwis_station_id"] = scenario.SelectedReferenceGage.StationID;
                        body["parameters"] = scenario.Parameters.map(function (item) { return { code: item.code, value: item.value }; });
                        break;
                    case "FLA":
                        url = configuration.baseurls['Service'] + configuration.queryparams['RegressionScenarios'].format(scenario.code);
                        body["startdate"] = scenario.startDate;
                        body["enddate"] = scenario.endDate;
                        body["nwis_station_id"] = scenario.SelectedReferenceGage.StationID;
                        body["parameters"] = scenario.Parameters.map(function (item) { return { code: item.code, value: item.value }; });
                        body["region"] = 3; //(<Models.FAScenario>scenario).regionID;
                } //end switch               
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(body));
                this.Execute(request).then(function (response) {
                    //console.log('delineation response headers: ', response.headers());                    
                    scenario.result = response.data;
                    scenario.status = StreamEst.Models.ScenarioStatus.e_complete;
                }, function (error) {
                    scenario.status = StreamEst.Models.ScenarioStatus.e_error;
                    scenario.Disclaimers["error"] = "Execution Error";
                }).finally(function () {
                    //raise event
                    _this._busyCount--;
                    if (!_this.isBusy)
                        _this.eventmanager.RaiseEvent(Services.onStudyAreaExcecuteComplete, _this, StudyAreaEventArgs.Empty);
                });
            };
            StudyAreaService.prototype.computePRMSScenario = function (scenario) {
                var _this = this;
                //get all params for scenario
                var sd = moment(scenario.startDate).format('YYYY-MM-DD') + " 00:00:00";
                var ed = moment(scenario.endDate).format('YYYY-MM-DD') + " 00:00:00";
                var segmentGroup = scenario.SelectedSegmentList.group('RiverID');
                scenario.result = {};
                scenario.result["EstimatedFlow"] = {};
                angular.forEach(segmentGroup, function (value, key) {
                    _this._busyCount++;
                    var url = "";
                    var body = {};
                    var tableID = Number(key) + 42; // +42 inorder to shift from layer to the tables
                    var nseg = value.map(function (item) { return "nsegment = " + item.SegmentID; }).join(" OR ");
                    body["where"] = "({0}) AND (date'{1}' <= tstamp AND tstamp <= date'{2}')".format(nseg, sd, ed);
                    body["outFields"] = "segment_cf,nsegment,tstamp_str,tstamp";
                    body["returnDistinctValues"] = false;
                    body['f'] = "pjson";
                    url = configuration.regions.IA['PRMS'].url + "/{0}/query".format(tableID.toString());
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", body, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                    _this.Execute(request).then(function (response) {
                        console.log(key, url);
                        var resultresponse = response.data.features.map(function (item) { return (new StreamEst.Models.TimeSeriesObservation(new Date(item.attributes.tstamp_str), item.attributes.segment_cf, item.attributes.nsegment)); }).group('Code');
                        var results = [];
                        for (var responsekey in resultresponse) {
                            var eFlow = new StreamEst.Models.TimeSeries();
                            eFlow.Name = 'PRMS seg: ' + responsekey + ', ' + _this.prmsNameLookup[key];
                            eFlow.SeriesDescription = "Estimates computed using Precipitation-Runoff Modeling System.";
                            eFlow.StartDate = scenario.startDate;
                            eFlow.EndDate = scenario.endDate;
                            eFlow.Observations = resultresponse[responsekey];
                            results.push(eFlow);
                        } //next responsekey
                        scenario.result["EstimatedFlow"][_this.prmsNameLookup[key]] = results;
                    }, function (error) {
                        scenario.status = StreamEst.Models.ScenarioStatus.e_error;
                        scenario.Disclaimers["error"] = "Execution Error";
                    }).finally(function () {
                        //raise event
                        _this._busyCount--;
                        if (!_this.isBusy) {
                            scenario.status = StreamEst.Models.ScenarioStatus.e_complete;
                            _this.eventmanager.RaiseEvent(Services.onStudyAreaExcecuteComplete, _this, StudyAreaEventArgs.Empty);
                        }
                    });
                }); //next key
            };
            StudyAreaService.prototype.loadPRMSNameLookup = function () {
                var _this = this;
                var url = configuration.regions.IA['PRMS'].url + "?f=pjson";
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    _this.prmsNameLookup = {};
                    //console.log('delineation response headers: ', response.headers());                    
                    response.data["layers"].forEach(function (l) { _this.prmsNameLookup[l.id] = l.name; });
                }, function (error) {
                    _this.prmsNameLookup = {
                        0: "One Hundred and Two River",
                        1: "Boyer River",
                        2: "Big Sioux River",
                        3: "Chariton River",
                        4: "Des Moines River",
                        5: "Floyd River",
                        6: "Fox River",
                        7: "Iowa River",
                        8: "Keg River",
                        9: "Little Sioux River",
                        10: "Maquoketa River",
                        11: "Moana-Harrison Ditch",
                        12: "Nishnabotna River",
                        13: "Nodaway River",
                        14: "Fox River",
                        15: "Soldier River",
                        16: "Thompson River",
                        17: "Turkey River",
                        18: "Upper Iowa River",
                        19: "Wapsipinicon River",
                        20: "Yellow River"
                    };
                });
            };
            //EventHandlers Methods
            //-+-+-+-+-+-+-+-+-+-+-+- 
            StudyAreaService.prototype.onStudyAreaChanged = function (sender, e) {
                //console.log('in onStudyAreaChanged');
            };
            return StudyAreaService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', 'WiM.Event.EventManager', 'StreamEst.Services.ModalService'];
        function factory($http, eventManager, modalservice) {
            return new StudyAreaService($http, eventManager, modalservice);
        }
        angular.module('StreamEst.Services')
            .factory('StreamEst.Services.StudyAreaService', factory);
    })(Services = StreamEst.Services || (StreamEst.Services = {}));
})(StreamEst || (StreamEst = {})); //end module
//# sourceMappingURL=StudyAreaService.js.map