//------------------------------------------------------------------------------
//----- ReportrController ------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//04.14.2015 jkn - Created

//Imports"
declare var d3: any;
module StreamEst.Controllers {

    declare var jsPDF;

    'use strinct';
    interface IReportControllerScope extends ng.IScope {
        vm: ReportController;
    }
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
    }
    interface IReportController {
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IMapLayers {
        baselayers: Object;
        overlays: Object;
    }
    interface ILayer {
        name: string;
        url: string;
        type: string;
        visible: boolean;
        layerOptions: Object;
    }
    class Center implements ICenter {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public lat: number;
        public lng: number;
        public zoom: number;
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(lt: number, lg: number, zm: number) {
            this.lat = lt;
            this.lng = lg;
            this.zoom = zm;
        }
    } 

    class ReportController implements IReportController  {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private $timeout: ng.ITimeoutService;
        private studyAreaService: Services.IStudyAreaService;
        private leafletData: ILeafletData;

        public close: any;
        public print: any;
        
        public markers: Object = null;
        public overlays: Object = null;
        public center: ICenter = null;
        public bounds: any;
        public layers: IMapLayers = null;
        public geojson: Object;
        public defaults: any;        
        public reportTitle: string;
        public reportComments: string;
        public angulartics: any;
        public selectedTabName: string;
        public selectedSecondaryTabName: string;
        public citations: Array<Models.ICitation>;
        public selectedScenario: Models.IScenario;
        public selectedGraphData: Array<any>;
        public selectedGraphOption: any;

        public get StudyAreasReady(): boolean {
            var sa = this.studyAreaService.studyAreas;
            if (Object.keys(sa).length === 0) return false;
            for (var key in sa) {
                if (sa[key].status != Models.StudyAreaStatus.e_ready) {
                    return false;
                }//end if
            };//next sa
            return true;
        }
        public get studyAreaParametersReady(): boolean {
            var sa = this.studyAreaService.getStudyArea(Models.StudyAreaType.e_basin);
            if (sa == null) return false;
            if ((<Models.IStatisticStudyArea>sa).computedParametersList.length < 1) return false; 

            return true;
        }
        public get studyAreaParameters(): Array<Models.IParameter> {
            var sa = this.studyAreaService.getStudyArea(Models.StudyAreaType.e_basin);
            if (sa == null) return null;
            return (<Models.IStatisticStudyArea>sa).computedParametersList;
        }
        public get reportDate(): Date {
            return new Date();
        }
        public get startDate(): Date{
            return new Date();
        }
        public get endDate(): Date {
            return new Date();
        }

        private _scenarioFlows: Array<Models.ITimeSeries>
        public get scenarioFlows():Array<Models.ITimeSeries>
        {
            return this._scenarioFlows;
        }
        private _canEdit: boolean;
        public get canEdit(): boolean {
            return this._canEdit;
        }
        private _availableTabNames: Array<string>;
        public get availableTabNames(): Array<string> {
            return this._availableTabNames;
        }
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope','$timeout', '$analytics', '$modalInstance', 'StreamEst.Services.StudyAreaService', 'leafletData', 'StreamEst.Services.ModalService'];
        constructor($scope: IReportControllerScope, $timeout:ng.ITimeoutService, $analytics, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService, leafletData: ILeafletData, modalservice:Services.IModalService) {
            $scope.vm = this;

            this.$timeout = $timeout;
            this.angulartics = $analytics;
            this.studyAreaService = studyArea;
            this.leafletData = leafletData;
            this.citations = [];            
            if (modalservice.modalOptions != null && modalservice.modalOptions.editable != null) this._canEdit = modalservice.modalOptions.editable;                
            this.selectedGraphData = [];
            this.init();
            
            $scope.$on('leafletDirectiveMap.load',(event, args) => {
                //console.log('report map load');
                this.showFeatures();
            });
            this.close = function () {
                $modalInstance.dismiss('cancel');
            };
            this.print = function () {
                window.print();
            };       
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public selectTab(tabname: string): void {
            if (this.selectedTabName == tabname) return;
            this.selectedTabName = tabname;
            this.loadGraphData(tabname);
            if (this.availableTabNames.indexOf(tabname) < 0) return;

            this.selectedScenario = this.getScenarioByName(tabname);                
        }
        public selectSecondaryTab(tabname: string): void {
            if (this.selectedSecondaryTabName == tabname) return;
            this.selectedSecondaryTabName = tabname;            
        }
        public refreshParameter(parameter: Models.IParameter) {
            parameter['isbusy'] = true;
            this.studyAreaService.refreshParameter(parameter);
        }
        public downloadCSV() {

            //ga event
            this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });

            var filename = 'data.csv';

            var processParameterTable = (data) => {
                var finalVal = '\n\nParameters\n';
                //if (this.studyAreaService.Disclaimers['isRegulated']) finalVal += 'Name,Value,Reglated Value, Unregulated Value, Unit\n';
                //else finalVal += 'Name,Value,Unit\n';

                //data.forEach((item) => {
                //    if (this.studyAreaService.Disclaimers['isRegulated']) finalVal += item.name + ',' + item.value + ',' + item.unRegulatedValue.toFixed(2) + ',' + item.regulatedValue.toFixed(2) + ',' + item.unit + '\n';
                //    else finalVal += item.name + ',' + item.value + ',' + item.unit + '\n';                   
                //});
                return finalVal + '\n';
            };

            var processScenarioParamTable = (statGroup) => {
                var finalVal = '';
     
                statGroup.RegressionRegions.forEach((regressionRegion) => {
                    //console.log('regression regions loop: ', regressionRegion)

                    //bail if in Area-Averaged section
                    if (regressionRegion.Name == 'Area-Averaged') return;

                    finalVal += statGroup.Name + ' Parameters, ' + regressionRegion.PercentWeight.toFixed(0) + ' Percent  ' + regressionRegion.Name.split("_").join(" ") + '\n';
                    finalVal += 'Name,Value,Min Limit, Max Limit\n';

                    if (regressionRegion.Parameters) {
                        regressionRegion.Parameters.forEach((item) => {
                            finalVal += item.Name + ',' + item.Value + ',' + item.Limits.Min.toFixed(2) + ',' + item.Limits.Max.toFixed(2) + '\n';
                        });
                    }
                });
                return finalVal + '\n';
            };

            var processScenarioFlowTable = (statGroup) => {
                //console.log('ScenarioFlowTable statGroup: ', statGroup);
                var finalVal = '';

                statGroup.RegressionRegions.forEach((regressionRegion) => {
                    //console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);
                    
                    var regionPercent;
                    if (regressionRegion.PercentWeight) regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                    else regionPercent = '';
                    finalVal += statGroup.Name + ' Flow Report, ' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\n';
                    finalVal += 'Name,Value,Unit,Prediction Error\n'

                    regressionRegion.Results.forEach((item) => {
                        //console.log('ScenarioFlowTable regressionRegion item: ', item);
                        var unit;
                        if (item.Unit) unit = item.Unit.Abbr;
                        else unit = '';
                        var errors;
                        if (item.Errors) errors = item.Errors[0].Value;
                        else errors = '--';
                        finalVal += item.Name + ',' + item.Value.toFixed(0) + ',' + unit + ',' + errors + '\n';
                    });
                });
                return finalVal + '\n';
            };

            //var csvFile = 'StreamEst Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' //+ this.studyAreaService.selectedStudyArea.Date.toLocaleString();


            ////process parametertable
            //csvFile += processParameterTable(this.studyAreaService.studyAreaParameterList);

            //this.nssService.selectedStatisticsGroupList.forEach((statGroup) => {
            //    csvFile += processScenarioParamTable(statGroup);
            //    csvFile += processScenarioFlowTable(statGroup);
            //});


            //var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
            //if (navigator.msSaveBlob) { // IE 10+
            //    navigator.msSaveBlob(blob, filename);
            //} else {
            //    var link = <any>document.createElement("a");
            //    var url = URL.createObjectURL(blob);
            //    if (link.download !== undefined) { // feature detection
            //        // Browsers that support HTML5 download attribute
            //        link.setAttribute("href", url);
            //        link.setAttribute("download", filename);
            //        link.style.visibility = 'hidden';
            //        document.body.appendChild(link);
            //        link.click();
            //        document.body.removeChild(link);
            //    }
            //    else {
            //        window.open(url);
            //    }
            //}

        }
        public downloadGeoJSON() {
            //var GeoJSON = angular.toJson(this.studyAreaService.selectedStudyArea.Features[1].feature);

            //var filename = 'data.geojson';

            //var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
            //if (navigator.msSaveBlob) { // IE 10+
            //    navigator.msSaveBlob(blob, filename);
            //} else {
            //    var link = <any>document.createElement("a");
            //    var url = URL.createObjectURL(blob);
            //    if (link.download !== undefined) { // feature detection
            //        // Browsers that support HTML5 download attribute
            //        link.setAttribute("href", url);
            //        link.setAttribute("download", filename);
            //        link.style.visibility = 'hidden';
            //        document.body.appendChild(link);
            //        link.click();
            //        document.body.removeChild(link);
            //    }
            //    else {
            //        window.open(url);
            //    }
            //}

        }
        public downloadPDF() {
            var pdf = new jsPDF('p', 'pt', 'letter');
            // source can be HTML-formatted string, or a reference
            // to an actual DOM element from which the text will be scraped.

            //var source = $('#customers')[0];
            //var source = angular.element(document.getElementById('printArea'));
            var source = document.getElementById('printArea').innerHTML;
            //console.log(source);

            // we support special element handlers. Register them with jQuery-style 
            // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
            // There is no support for any other type of selectors 
            // (class, of compound) at this time.
            var specialElementHandlers = {
                // element with id of "bypass" - jQuery style selector
                '#bypassme': function (element, renderer) {
                    // true = "handled elsewhere, bypass text extraction"
                    return true
                }
            };
            var margins = {
                top: 80,
                bottom: 60,
                left: 40,
                width: 522
            };
            // all coords and widths are in jsPDF instance's declared units
            // 'inches' in this case
            pdf.fromHTML(
                source, // HTML string or DOM elem ref.
                margins.left, // x coord
                margins.top, { // y coord
                    'width': margins.width, // max width of content on PDF
                    'elementHandlers': specialElementHandlers
                },

                function (dispose) {
                    // dispose: object with X, Y of the last line add to the PDF 
                    //          this allow the insertion of new lines after html
                    pdf.save('Test.pdf');
                }, margins);
        }
        public loadScenario(scenarioCode:string) {
            console.log(scenarioCode);
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private initMap(): void {
            this.center = new Center(42, -93, 8);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: {}
            }
            this.geojson = {};
            L.Icon.Default.imagePath = 'images';
            this.defaults = {
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false
            }
        }
        private init() {
            var sa = this.studyAreaService.studyAreas;
            this._availableTabNames = [];
            this._scenarioFlows = [];
            if (Object.keys(sa).length != 0) {
                for (var key in sa) {
                    sa[key].Scenarios.forEach((s) => {                        
                        if(s.status > Models.ScenarioStatus.e_initialized || s.status == Models.ScenarioStatus.e_error)
                            this._availableTabNames.push(s.code.toLowerCase());
                        if (this.loadScenarioFlow(s))
                            this._availableTabNames.push('flow');                                             
                    });//next s                    
                };//next sa
            }//end if

            this.reportTitle = 'StreamEst Report';
            this.reportDate = new Date();
            this.selectedTabName = "studyarea";

            this.initMap()
            this.LoadCitations();
        }
        private loadScenarioFlow(s: Models.IScenario):boolean {
            if (s.status != Models.ScenarioStatus.e_complete && !s.result.hasOwnProperty("EstimatedFlow")) return false
            switch (s.code.toLowerCase()) {
                case 'fdctm':
                case 'fla':
                    this._scenarioFlows.push(s.result["EstimatedFlow"]);
                    break;
                case 'prms':
                    //loop over items and push separate
                    if (Object.keys(s.result["EstimatedFlow"]).length === 0) return;
                    for (var key in s.result["EstimatedFlow"]) {
                        s.result["EstimatedFlow"][key].forEach((ts:Models.ITimeSeries) => {
                            this._scenarioFlows.push(ts)
                        });//next                        
                    }//next key

                    break;
            }//end switch
            return true;
        }
        private LoadCitations() {
            this.citations = Citations;
        }
        private showFeatures(): void {
            this.overlays = {};
            this.geojson = {};
            var sa = this.studyAreaService.studyAreas;
            if (Object.keys(sa).length === 0) return;
            for (var key in sa) {
                if (sa[key].status == Models.StudyAreaStatus.e_ready) {
                    sa[key].Features.forEach((item) => {
                        //console.log('in each loop', item.name);
                        if (item.name == 'globalwatershed') {
                            this.layers.overlays[item.name] = {
                                name: 'Basin Boundary',
                                type: 'geoJSONShape',
                                data: item.feature,
                                visible: true,
                                layerOptions: {
                                    style: {
                                        fillColor: "yellow",
                                        weight: 2,
                                        opacity: 1,
                                        color: 'white',
                                        fillOpacity: 0.5
                                    }
                                }
                            }

                            var bbox = this.layers.overlays[item.name].data.features[0].bbox;
                            this.leafletData.getMap().then((map: any) => {
                                //method to reset the map for modal weirdness
                                map.invalidateSize();
                                //console.log('in getmap: ', bbox);
                                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                            });
                        }
                        else if (item.name == 'globalwatershedpoint') {
                            this.layers.overlays[item.name] = {
                                name: 'Basin Clicked Point',
                                type: 'geoJSONShape',
                                data: item.feature,
                                visible: true,
                            }
                        }
                        else {
                            this.geojson[item.name] = {
                                data: item.feature
                            }
                        }

                    });

                }//end if
            };//next sa
            
        }
        private getScenarioByName(scenarioName: string):Models.IScenario {
            var sa = this.studyAreaService.studyAreas;
            if (Object.keys(sa).length == 0) return;

            for (var key in sa) {
                for (var i = 0; i < sa[key].Scenarios.length; i++) {
                    if (sa[key].Scenarios[i].code.toLowerCase() === scenarioName) {
                       return sa[key].Scenarios[i];
                    }//end if
                }//next i
            };//next sa  

        }
        private loadGraphData(name: string) {
            var result: Array<any> = [];
            var data: Array<any>;
            switch (name) {
                case "fdctm":
                    this.setGraphOption(name);
                    var scen = this.getScenarioByName(name);
                    data = [];
                    if (!scen.result) return;
                    for (var key in (<any>scen.result).ExceedanceProbabilities) {
                        data.push({ label: key, value: (<any>scen.result).ExceedanceProbabilities[key] })
                    }//next key

                    result.push({
                        values: data,
                        area: true,
                        color: '#7777ff'
                    });
                    break;
                case "flow":
                    this.setGraphOption(name);
                    this.scenarioFlows.forEach((sf) => {
                        data = sf.Observations.map((obs) => { return {x: new Date(<any>obs.Date).getTime(), y:obs.Value} });
                        result.push({key:sf.Name,values:data});
                    });//next sf

                    break;
            }//end switch
            this.selectedGraphData = result;

            //solves graph width problem
            this.$timeout(() => {
                window.dispatchEvent(new Event('resize'));
                //this.fetching = true;
            }, 200);
        }
        private setGraphOption(graphType: string): any {
            switch (graphType) {
                case "fdctm":
                    this.selectedGraphOption = {
                        chart: {
                            type: 'lineChart',
                            height: 450,
                            margin: {
                                top: 20,
                                right: 30,
                                bottom: 60,
                                left: 65
                            },
                            x: function (d) { return d.label; },
                            y: function (d) { return d.value; },
                            showLegend: false,
                            valueFormat: function (d) {
                                return d3.format(',.3f')(d);
                            },
                            xAxis: {
                                showMaxMin: false

                            },
                            yAxis: {
                                axisLabel: 'Discharge (CFS)',
                                tickFormat: function (d) {
                                    return d3.format(',.0f')(d);
                                },
                                tickValues: [1, 10, 100, 1000, 10000, 1000000]
                            },
                            yScale: d3.scale.log(),
                            title: {
                                enable: true,
                                text: "Flow Duration Curve Transfer Method Model Estimated Exceedance Probabilities"
                            }
                        }

                    };
                    break;
                case "flow":
                    this.selectedGraphOption = {
                        chart: {
                            type: 'lineChart',
                            height: 450,
                            margin: {
                                top: 20,
                                right: 20,
                                bottom: 50,
                                left: 75
                            },
                            x: function (d) {
                                return new Date(d.x).getTime();
                            },
                            y: function (d) {
                                return d.y;
                            },
                            useInteractiveGuideline: false,
                            interactive: false,
                            tooltips: true,
                            xAxis: {
                                tickFormat: function (d) {
                                    return d3.time.format('%x')(new Date(d));
                                },
                                rotateLabels: 30,
                                showMaxMin: false


                            },
                            yAxis: {
                                axisLabel: 'Estimated Discharge (cfs)',
                                tickFormat: function (d) {
                                    return d3.format('.02f')(d);
                                },
                                showMaxMin:false
                                
                            },
                            zoom: {
                                enabled: true,
                                scaleExtent: [1, 10],
                                useFixedDomain: false,
                                useNiceScale: false,
                                horizontalOff: false,
                                verticalOff: false,
                                unzoomEventType: 'dblclick.zoom'
                            }
                        }
                    }
                    break;
            }//end switch

        }
    }//end class
    angular.module('StreamEst.Controllers')
        .controller('StreamEst.Controllers.ReportController', ReportController)     

}//end module
   