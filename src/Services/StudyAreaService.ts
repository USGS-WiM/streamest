//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
//------------------------------------------------------------------------------

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
module StreamEst.Services {
    'use strict'
    export interface IStudyAreaService {
        studyAreas: { [key: number]: Models.IStudyArea };
        addStudyArea(key: Models.StudyAreaType, sa: Models.IStudyArea): boolean;
        removeStudyArea(key: Models.StudyAreaType);
        getStudyArea(key: Models.StudyAreaType): Models.IStudyArea;
        containsStudyArea(key: Models.StudyAreaType): boolean;
        addScenario(scenario: Models.IScenario): void;
        scenarioExists(scenario: Models.IScenario): boolean;
        removeScenario(scenario: Models.IScenario): void;
        initializeStudyArea(saType: Models.StudyAreaType): void;
        loadStudyArea(workspaceID: string): void;
        getstudyAreaFeatures(LayerName: string): Array<any>
        loadScenarios(): void;
        isBusy: boolean;
        verifyScenariosStatus(status: Models.ScenarioStatus): boolean;
        computeScenarios(startDate: Date, endDate: Date): void;
        refreshParameter(parameter: Models.IParameter): void;
        prmsNameLookup: { [key: number]: string };
        removePRMSSegment(seg: Models.IPRMSSegment)
    }
    export var onSelectedStudyAreaChanged: string = "onSelectedStudyAreaChanged";
    export var onStudyAreaDoInit: string = "onStudyAreaDoInit";
    export var onStudyAreaLoadComplete: string = "onStudyAreaLoadComplete";
    export var onStudyAreaRemoved: string = "onStudyAreaRemoved";
    export var onStudyAreaExcecuteComplete: string = "onStudyAreaExcecuteComplete";
    export class StudyAreaEventArgs extends WiM.Event.EventArgs {
        //properties
        public studyArea: Models.IStudyArea;
        public studyAreaType: Models.StudyAreaType;
        constructor() {
            super();
        }
    }

    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private eventmanager: WiM.Event.IEventManager;
        private modalservice: Services.IModalService;
        public prmsNameLookup: { [key: number]: string }
        private _busyCount: number = 0;
        public get isBusy(): boolean {
            if (this._busyCount > 0) {
                return true;
            }
            this._busyCount = 0;
            return false;
        }
        
        //Dictionaries
        //-+-+-+-+-+-+-+-+-+-+-+-
        private _studyAreas: { [key: number]: Models.IStudyArea } = {};
        public get studyAreas(): { [key: number]: Models.IStudyArea } {
            return this._studyAreas;
        }
        public addStudyArea(key: Models.StudyAreaType, sa: Models.IStudyArea): boolean {
            if (this.containsStudyArea(key)) return false;
            this._studyAreas[key] = sa;
            return true;
        }
        public removeStudyArea(key: Models.StudyAreaType) {
            if (this.containsStudyArea(key))
                delete this._studyAreas[key];

            return true;
        }
        public getStudyArea(key: Models.StudyAreaType): Models.IStudyArea {
            if (this.containsStudyArea(key))
                return this._studyAreas[key];

            return null;
        }
        public containsStudyArea(key: Models.StudyAreaType): boolean {
            if (key in this._studyAreas) return true;
            else return false;
        }
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(public $http: ng.IHttpService, eventManager: WiM.Event.IEventManager, modal: Services.IModalService) {
            super($http, configuration.baseurls['StreamStats'])
            this.eventmanager = eventManager;
            this.modalservice = modal;

            this.init();
            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyAreaChanged);
            eventManager.AddEvent<StudyAreaEventArgs>(onStudyAreaRemoved);
            eventManager.AddEvent<StudyAreaEventArgs>(onStudyAreaLoadComplete);
            eventManager.AddEvent<StudyAreaEventArgs>(onStudyAreaExcecuteComplete);

        }
        
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public addScenario(scenario: Models.IScenario): void {
            var saType = this.getStudyAreaType(scenario.type);
            var sa = this.getStudyArea(saType);
            if (sa == null) sa = this.addStudyAreaByType(saType);
            sa.Scenarios.push(scenario)
        }
        public scenarioExists(scenario: Models.IScenario): boolean {
            var saType = this.getStudyAreaType(scenario.type);
            var sa = this.getStudyArea(saType);
            if (sa == null) return false;
            var index = sa.Scenarios.indexOf(scenario)
            if (index > -1) return true;
            return false;
        }
        public removeScenario(scenario: Models.IScenario): void {
            var saType = this.getStudyAreaType(scenario.type);
            var sa = this.getStudyArea(saType);
            if (sa == null) return;
            var index: number = sa.Scenarios.indexOf(scenario)
            if (index < 0) return;
            sa.Scenarios.splice(index, 1);
        }
        public initializeStudyArea(saType:Models.StudyAreaType): void {
            var sa = <Models.IStatisticStudyArea>this.getStudyArea(saType);
            switch (saType) {
                case Models.StudyAreaType.e_basin:

                    var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', sa.RegionID, sa.Pourpoint.Longitude.toString(),
                        sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false)
                    var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

                    this.Execute(request).then(
                        (response: any) => {  
                            //console.log('delineation response headers: ', response.headers());
                            sa.Disclaimers["Server"] = response.headers()['usgswim-hostname'];

                            if (response.data.hasOwnProperty("messages")) sa.Disclaimers["DelineationMessages"] = response.data.messages;

                            if (response.data.hasOwnProperty("featurecollection")) {
                                //loop through and add to features
                                (<Array<any>>response.data["featurecollection"]).forEach((item) => {
                                    sa.Features.push(item);
                                });
                                
                                sa.status = Models.StudyAreaStatus.e_initialized;
                            }//end if
                            sa.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                            //sm when complete
                    
                        }, (error) => {
                            sa.status = Models.StudyAreaStatus.e_error;
                            sa.Disclaimers["error"] = "Delineation Error";

                        }).finally(() => {
                            var eventArgs = new StudyAreaEventArgs();
                            eventArgs.studyArea = sa;
                            this.eventmanager.RaiseEvent(onSelectedStudyAreaChanged, this, eventArgs);
                        });
                    break;
                case Models.StudyAreaType.e_segment:
                    break;

            }//end switch
        }
        public loadStudyArea(workspaceID:string): void {
            try {
                var sa = new Models.StudyArea();
                sa.status = Models.StudyAreaStatus.e_initialized;
                this.addStudyArea(sa.studyAreaType, sa);
                
                switch (sa.studyAreaType) {
                    case Models.StudyAreaType.e_basin:
                        var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSwatershedByWorkspace'].format('geojson', "IA", workspaceID, 4326)
                        var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
                        this.Execute(request).then(
                            (response: any) => {
                                sa.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                                sa.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                                sa.RegionID ='IA',
                                sa.CreatedDate = new Date();
                                //set point
                                sa.Features.forEach((layer) => {
                                    var item = angular.fromJson(angular.toJson(layer));

                                    if (item.name == 'globalwatershedpoint') {
                                        //get and set geometry
                                        var geom = item.feature.features[0].bbox
                                        sa.Pourpoint = new WiM.Models.Point(geom[1], geom[0], item.feature.crs.properties.code);
                                        return;
                                    }//end if
                                });                      
                                sa.status = Models.StudyAreaStatus.e_initialized
                        
                                //sm when complete
                            }, (error) => {
                                //sm when error
                                sa.status = Models.StudyAreaStatus.e_error;
                                sa.Disclaimers["error"] = "Delineation Error";
                            }).finally(() => {
                                var eventArgs = new StudyAreaEventArgs();
                                eventArgs.studyArea = sa;
                                this.eventmanager.RaiseEvent(onSelectedStudyAreaChanged, this, eventArgs);
                            });
                        break;
                }//end switch             

            }
            catch (err) {
                return;
            }

        }
        public getstudyAreaFeatures(LayerName: string):Array<any> {
            var features: Array<any> = [];
            for (var property in this.studyAreas) {
                if (this.studyAreas.hasOwnProperty(property) && this.studyAreas[property].Features.length > 0) {                    
                    for (var i = 0; i < this.studyAreas[property].Features.length; i++) {
                        if (this.studyAreas[property].Features[i].name == LayerName) features.push(this.studyAreas[property].Features[i]);
                    }//next i                   
                }//end if
            }//next property            

            return features;
        }
        public loadScenarios(): void {
            if (this.isBusy) return;
            //gets the parameters required for this scenario
            var sa = this.studyAreas;
            if (Object.keys(sa).length === 0) return;
            for (var key in sa) {
                if (sa[key].status != Models.StudyAreaStatus.e_initialized) return;
                if (sa[key].studyAreaType == Models.StudyAreaType.e_basin) this.loadParameters(<Models.IStatisticStudyArea>sa[key]);
                if (sa[key].studyAreaType == Models.StudyAreaType.e_basin) this.loadReferenceGage(<Models.IStatisticStudyArea>sa[key]);
                if (sa[key].studyAreaType == Models.StudyAreaType.e_segment && !this.isBusy) { sa[key].status = Models.StudyAreaStatus.e_ready; this.eventmanager.RaiseEvent(onStudyAreaLoadComplete, this, StudyAreaEventArgs.Empty); }
            };//next sa

        }
        public verifyScenariosStatus(status: Models.ScenarioStatus):boolean{
            var sa = this.studyAreas;
            if (Object.keys(sa).length === 0) return;
            for (var key in sa) {
                if (sa[key].status != Models.StudyAreaStatus.e_ready) return false;
                sa[key].Scenarios.forEach((scenario)=> {
                    if (status == Models.ScenarioStatus.e_loaded &&
                        (scenario.status <= Models.ScenarioStatus.e_initialized || scenario.status == Models.ScenarioStatus.e_error)) return false;
                    else if (status != scenario.status) return false;
                });//next scenario
            };//next sa
            return true;
        }        
        public computeScenarios(startDate:Date,endDate:Date): void {
          if (this.isBusy) return;
          var sa = this.studyAreas;
          if (Object.keys(sa).length === 0) return;
          for (var key in sa) {
              if (sa[key].status != Models.StudyAreaStatus.e_ready) return;
              sa[key].Scenarios.forEach((scenario) => {
                  scenario.startDate = startDate;
                  scenario.endDate = endDate;
                  if (scenario.code == "FDCTM" || scenario.code == "FLA") this.computeScenario(scenario);
                  if (scenario.code == "PRMS") this.computePRMSScenario(<Models.PRMSScenario>scenario);
              });//next scenario
          };//next sa
        }
        public refreshParameter(parameter:Models.IParameter) {
            //get all params for scenario
            var sa: Models.IStatisticStudyArea = <Models.IStatisticStudyArea>this.getStudyArea(Models.StudyAreaType.e_basin);
            var Paramindex = sa.computedParametersList.indexOf(parameter);
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(sa.RegionID, sa.WorkspaceID, parameter.code);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {  
                    //console.log('delineation response headers: ', response.headers());                    
                    if (response.data.hasOwnProperty("messages")) sa.Disclaimers["ParameterMessages"] = response.data.messages;
                    if (response.data.hasOwnProperty("parameters")) {
                        //load sa
                        var responsevalue = response.data.parameters.map((rParam) => { return new Models.Parameter(rParam.name, rParam.code, rParam.description, rParam.unit, rParam.value) });
                        
                        if (Paramindex < 0) return;
                        sa.computedParametersList[Paramindex].value = responsevalue[0].value;
                        sa.computedParametersList[Paramindex]['isbusy'] = false;
                        sa.Scenarios.forEach((scenario) => {
                            if (scenario.hasOwnProperty("Parameters")) {
                                for (var p = 0; p < scenario["Parameters"].length; p++) {
                                    var param = scenario["Parameters"][p];
                                    for (var i = 0; i < response.data.parameters.length; i++) {
                                        var pr = response.data.parameters[i];
                                        if (pr.code.toUpperCase() === param.code.toUpperCase()) {
                                            param.value = pr.value;
                                            break;
                                        }//end if
                                    }//next i
                                };//next p
                            }//end if                           
                        });//next scenario
                    }//end if 
                    //sm when complete
                    
                }, (error) => {
                    sa.status = Models.StudyAreaStatus.e_error;
                    sa.Disclaimers["error"] = "Delineation Error";
                }).finally(() => {                
                });
        }
        public removePRMSSegment(seg: Models.IPRMSSegment) {
            var sa = this.getStudyArea(Models.StudyAreaType.e_segment);
            if (sa == null) return;
            var segindex = (<Models.PRMSScenario>sa.Scenarios[0]).SelectedSegmentList.indexOf(seg);
            if (segindex < 0) return;
            (<Models.PRMSScenario>sa.Scenarios[0]).SelectedSegmentList.splice(segindex, 1);
            this.eventmanager.RaiseEvent(WiM.Directives.onLayerChanged, this, new WiM.Directives.LegendLayerChangedEventArgs("PRMSSeg_"+seg.RiverID+"."+seg.SegmentID, "visible", false));
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+- 
        private init() {
            this.loadPRMSNameLookup();
        }
        private addStudyAreaByType(saType: Models.StudyAreaType): Models.IStudyArea {
            var result: Models.IStudyArea;
            switch (saType) {
                case Models.StudyAreaType.e_basin:
                    result = new Models.StudyArea();
                    break;
                case Models.StudyAreaType.e_segment:
                    result = new Models.SegmentStudyArea();
                    break;
            }//end switch
            this.modalservice.openModal(SSModalType.e_selectstudyarea);
            this.addStudyArea(saType, result);
            return result;
        }
        private getStudyAreaType(scenarioType: number): Models.StudyAreaType {
            switch (scenarioType) {
                case 1:
                    return Models.StudyAreaType.e_basin;
                case 2:
                    return Models.StudyAreaType.e_segment;
                default:
                    return null;
            }//end swtich
        }
        private loadParameters(sa: Models.IStatisticStudyArea) {
            this._busyCount++;
            //get all params for scenario
            var paramcodes: Array<string> = [];
            sa.Scenarios.forEach((item) => { if (item.hasOwnProperty("Parameters")) item["Parameters"].map((m: Models.IParameter) => { if(paramcodes.indexOf(m.code) <0 ) paramcodes.push( m.code); }); });

            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(sa.RegionID, sa.WorkspaceID, paramcodes.join(';'))
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {  
                    //console.log('delineation response headers: ', response.headers());                    
                    if (response.data.hasOwnProperty("messages")) sa.Disclaimers["ParameterMessages"] = response.data.messages;                    
                    if (response.data.hasOwnProperty("parameters")) {
                        //load sa
                        sa.computedParametersList = response.data.parameters.map((rParam) => {return new Models.Parameter(rParam.name, rParam.code,rParam.description,rParam.unit,rParam.value) })
                        sa.Scenarios.forEach((scenario) => {
                            if (scenario.hasOwnProperty("Parameters")) {
                                for (var p = 0; p < scenario["Parameters"].length; p++) {
                                    var param = scenario["Parameters"][p];
                                    for (var i = 0; i < response.data.parameters.length; i++) {
                                        var pr = response.data.parameters[i];
                                        if (pr.code.toUpperCase() === param.code.toUpperCase()) {
                                            param.value = pr.value;
                                            break;
                                        }//end if
                                    }//next i
                                };//next p
                            }//end if                           
                        });//next scenario
                    }//end if 
                    //sm when complete
                    
                }, (error) => {
                    sa.status = Models.StudyAreaStatus.e_error;
                    sa.Disclaimers["error"] = "Delineation Error";
                }).finally(() => {
                    //raise event
                    this._busyCount--;
                    if (!this.isBusy) { sa.status = Models.StudyAreaStatus.e_ready; this.eventmanager.RaiseEvent(onStudyAreaLoadComplete, this, StudyAreaEventArgs.Empty); }
                });
        }
        private loadReferenceGage(sa: Models.IStatisticStudyArea) {
            //get all params for scenario
            
            var url = "";
            sa.Scenarios.forEach((scenario) => {
               this._busyCount++;      
                if (!scenario.hasOwnProperty("ReferenceGageList") || !scenario.hasOwnProperty("SelectedReferenceGage")) return;
                switch (scenario.code) {
                    case "FDCTM":
                        url = configuration.baseurls['Service'];
                        url = url + configuration.queryparams['KrigService'].format(sa.RegionID, sa.Pourpoint.Longitude, sa.Pourpoint.Latitude, sa.Pourpoint.crs);
                        break;
                    case "FLA":
                       url = configuration.baseurls['GISserver'];
                        url = url + configuration.queryparams["FARefGage"].format("{" + "x:{0},y:{1}".format(sa.Pourpoint.Longitude.toString(), sa.Pourpoint.Latitude.toString()) + "}", sa.Pourpoint.crs);
                        break
                }//end switch                      

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {  
                    //console.log('delineation response headers: ', response.headers());                    
                    var result = response.data;
                    //sm when complete 
                    switch (scenario.code) {
                        case "FDCTM":
                            scenario["ReferenceGageList"] = [];
                            for (var i = 0; i < result.length; i++) {                                
                                var gage = new Models.ReferenceGage(result[i].ID, result[i].Name);
                                gage.DrainageArea_sqMI = result[i].DrainageArea;
                                gage.correlation = result[i].Correlation;
                                scenario["ReferenceGageList"].push(gage);
                                scenario["SelectedReferenceGage"] = scenario["ReferenceGageList"][0];
                            }//next i
                            break;
                        case "FLA":
                            scenario["ReferenceGageList"] = [];
                            for (var i = 0; i < result.features.length; i++) {                                
                                var attr = result.features[i].attributes;
                                var gage = new Models.ReferenceGage(attr["reference_gages.site_id"], attr["reference_gages.site_name"]);
                                gage.DrainageArea_sqMI = attr["reference_gages.da_gis_mi2"];
                                scenario["ReferenceGageList"].push(gage);
                                scenario["SelectedReferenceGage"] = scenario["ReferenceGageList"][0];
                                scenario["regionID"] = attr["regions_local.Region_Agg"]
                            }//next i
                            break;
                    }//end switch                   
                    scenario.status++;
                    
                }, (error) => {
                    sa.status = Models.StudyAreaStatus.e_error;
                    sa.Disclaimers["error"] = "Delineation Error";

                }).finally(() => {
                    //raise event
                    this._busyCount--;
                    if (!this.isBusy) {
                        sa.status = Models.StudyAreaStatus.e_ready; this.eventmanager.RaiseEvent(onStudyAreaLoadComplete, this, StudyAreaEventArgs.Empty);
                    }
                });

            }); 

        }
        private computeScenario(scenario: Models.IScenario) {
            //get all params for scenario
            this._busyCount++;
            var url = "";
            var body = {};
            switch (scenario.code) {
                case "FDCTM":      
                    url = configuration.baseurls['Service'] + configuration.queryparams['RegressionScenarios'].format(scenario.code);
                    body["startdate"] = scenario.startDate;
                    body["enddate"] = scenario.endDate;
                    body["nwis_station_id"] = (<Models.FDCTMScenario>scenario).SelectedReferenceGage.StationID;
                    body["parameters"] = (<Models.FDCTMScenario>scenario).Parameters.map((item) => { return { code: item.code, value: item.value } });                   
                   
                    break;
                case "FLA":
                    url = configuration.baseurls['Service'] + configuration.queryparams['RegressionScenarios'].format(scenario.code);
                    body["startdate"] = scenario.startDate;
                    body["enddate"] = scenario.endDate;
                    body["nwis_station_id"] = (<Models.FAScenario>scenario).SelectedReferenceGage.StationID;
                    body["parameters"] = (<Models.FAScenario>scenario).Parameters.map((item) => { return { code: item.code, value: item.value } });
                    body["region"] = 3//(<Models.FAScenario>scenario).regionID;
            }//end switch               
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true,WiM.Services.Helpers.methodType.POST,"json",angular.toJson(body));

            this.Execute(request).then(
                (response: any) => {  
                    //console.log('delineation response headers: ', response.headers());                    
                    scenario.result = response.data; 
                    scenario.status = Models.ScenarioStatus.e_complete;

                }, (error) => {
                    scenario.status = Models.ScenarioStatus.e_error;
                    scenario.Disclaimers["error"] = "Execution Error";

                }).finally(() => {
                    //raise event
                    this._busyCount--;
                    if (!this.isBusy) this.eventmanager.RaiseEvent(onStudyAreaExcecuteComplete, this, StudyAreaEventArgs.Empty);
                });


        }
        private computePRMSScenario(scenario: Models.PRMSScenario) {
            //get all params for scenario
            var sd = moment(scenario.startDate).format('YYYY-MM-DD') + " 00:00:00";
            var ed = moment(scenario.endDate).format('YYYY-MM-DD') + " 00:00:00";
            var segmentGroup = scenario.SelectedSegmentList.group('RiverID');
            scenario.result = {};
            scenario.result["EstimatedFlow"] = {};

            angular.forEach(segmentGroup, (value: Array<Models.IPRMSSegment>, key) => {  
                this._busyCount++;
                var url = "";
                var body = {};
                var tableID: number = Number(key) + 42; // +42 inorder to shift from layer to the tables
                var nseg = value.map((item: Models.IPRMSSegment) => { return "nsegment = " + item.SegmentID }).join(" OR ");

                body["where"] = "({0}) AND (date'{1}' <= tstamp AND tstamp <= date'{2}')".format(nseg, sd, ed);
                body["outFields"] = "segment_cf,nsegment,tstamp_str,tstamp";
                body["returnDistinctValues"] = false;
                body['f'] = "pjson";
                url = configuration.regions.IA['PRMS'].url + "/{0}/query".format(tableID.toString());

                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", body, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);

                this.Execute(request).then(
                    (response: any) => { 
                        console.log(key, url); 
                        var resultresponse = (<Array<any>>response.data.features).map((item) => { return (new Models.TimeSeriesObservation(new Date(item.attributes.tstamp_str), item.attributes.segment_cf, item.attributes.nsegment)) }).group('Code')
                        var results = [];
                        for (var responsekey in resultresponse) {
                            var eFlow = new Models.TimeSeries();
                            eFlow.Name = 'PRMS seg: ' + responsekey + ', '+this.prmsNameLookup[key];
                            eFlow.SeriesDescription = "Estimates computed using Precipitation-Runoff Modeling System.";
                            eFlow.StartDate = scenario.startDate;
                            eFlow.EndDate = scenario.endDate;
                            eFlow.Observations = <Array<Models.TimeSeriesObservation>>resultresponse[responsekey];
                            results.push(eFlow);
                        }//next responsekey
                                          
                        scenario.result["EstimatedFlow"][this.prmsNameLookup[key]] = results;                        
                        
                    }, (error) => {
                        scenario.status = Models.ScenarioStatus.e_error;
                        scenario.Disclaimers["error"] = "Execution Error";

                    }).finally(() => {
                        //raise event
                        this._busyCount--;
                        if (!this.isBusy) {scenario.status = Models.ScenarioStatus.e_complete; this.eventmanager.RaiseEvent(onStudyAreaExcecuteComplete, this, StudyAreaEventArgs.Empty); }
                    });

            });//next key

        }
        private loadPRMSNameLookup(): void {
            var url: string = configuration.regions.IA['PRMS'].url + "?f=pjson";

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
            this.Execute(request).then(
                (response: any) => {  
                    this.prmsNameLookup = {};
                    //console.log('delineation response headers: ', response.headers());                    
                    response.data["layers"].forEach((l) => { this.prmsNameLookup[l.id]= l.name  });

                }, (error) => {
                    this.prmsNameLookup = {
                        0 : "One Hundred and Two River",
                        1 :  "Boyer River",
                        2 :  "Big Sioux River",
                        3 :  "Chariton River",
                        4 :  "Des Moines River",
                        5 :  "Floyd River",
                        6 :  "Fox River",
                        7 :  "Iowa River",
                        8 :  "Keg River",
                        9 :  "Little Sioux River",
                        10 :  "Maquoketa River",
                        11 :  "Moana-Harrison Ditch",
                        12 :  "Nishnabotna River",
                        13 :  "Nodaway River",
                        14 :  "Fox River",
                        15 :  "Soldier River",
                        16 :  "Thompson River",
                        17 :  "Turkey River",
                        18 :  "Upper Iowa River",
                        19 :  "Wapsipinicon River",
                        20 :  "Yellow River"        
                    };

                });
        }
        //EventHandlers Methods
        //-+-+-+-+-+-+-+-+-+-+-+- 
        private onStudyAreaChanged(sender: any, e: StudyAreaEventArgs) {
            //console.log('in onStudyAreaChanged');
        }

    }//end class

    factory.$inject = ['$http', 'WiM.Event.EventManager','StreamEst.Services.ModalService'];
    function factory($http: ng.IHttpService, eventManager: WiM.Event.IEventManager, modalservice:IModalService) {
        return new StudyAreaService($http, eventManager, modalservice)
    }
    angular.module('StreamEst.Services')
        .factory('StreamEst.Services.StudyAreaService', factory)
}//end module