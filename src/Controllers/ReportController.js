//------------------------------------------------------------------------------
//----- ReportrController ------------------------------------------------------
//------------------------------------------------------------------------------
var StreamEst;
(function (StreamEst) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var Center = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        })();
        var ReportController = (function () {
            function ReportController($scope, $timeout, $analytics, $modalInstance, studyArea, leafletData, modalservice) {
                var _this = this;
                this.markers = null;
                this.overlays = null;
                this.center = null;
                this.layers = null;
                $scope.vm = this;
                this.$timeout = $timeout;
                this.angulartics = $analytics;
                this.studyAreaService = studyArea;
                this.leafletData = leafletData;
                this.citations = [];
                if (modalservice.modalOptions != null && modalservice.modalOptions.editable != null)
                    this._canEdit = modalservice.modalOptions.editable;
                this.selectedGraphData = [];
                this.init();
                $scope.$on('leafletDirectiveMap.load', function (event, args) {
                    //console.log('report map load');
                    _this.showFeatures();
                });
                this.close = function () {
                    $modalInstance.dismiss('cancel');
                };
                this.print = function () {
                    window.print();
                };
            }
            Object.defineProperty(ReportController.prototype, "canEdit", {
                get: function () {
                    return this._canEdit;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "StudyAreasReady", {
                get: function () {
                    var sa = this.studyAreaService.studyAreas;
                    if (Object.keys(sa).length === 0)
                        return false;
                    for (var key in sa) {
                        if (sa[key].status != StreamEst.Models.StudyAreaStatus.e_ready) {
                            return false;
                        } //end if
                    }
                    ; //next sa
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "studyAreaParametersReady", {
                get: function () {
                    var sa = this.studyAreaService.getStudyArea(StreamEst.Models.StudyAreaType.e_basin);
                    if (sa == null)
                        return false;
                    if (sa.computedParametersList.length < 1)
                        return false;
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "studyAreaParameters", {
                get: function () {
                    var sa = this.studyAreaService.getStudyArea(StreamEst.Models.StudyAreaType.e_basin);
                    if (sa == null)
                        return null;
                    return sa.computedParametersList;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "reportDate", {
                get: function () {
                    return new Date();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "startDate", {
                get: function () {
                    return new Date();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "endDate", {
                get: function () {
                    return new Date();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "availableScenarioNames", {
                get: function () {
                    return this._availableScenarioNames;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "scenarioFlows", {
                get: function () {
                    return this._scenarioFlows;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.prototype.selectTab = function (tabname) {
                if (this.selectedTabName == tabname)
                    return;
                this.selectedTabName = tabname;
                this.loadGraphData(tabname);
                if (this.availableScenarioNames.indexOf(tabname) < 0)
                    return;
                this.selectedScenario = this.getScenarioByName(tabname);
            };
            ReportController.prototype.selectSecondaryTab = function (tabname) {
                if (this.selectedSecondaryTabName == tabname)
                    return;
                this.selectedSecondaryTabName = tabname;
            };
            ReportController.prototype.refreshParameter = function (parameter) {
                //todo... refresh parameter
            };
            ReportController.prototype.downloadCSV = function () {
                //ga event
                this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });
                var filename = 'data.csv';
                var processParameterTable = function (data) {
                    var finalVal = '\n\nParameters\n';
                    //if (this.studyAreaService.Disclaimers['isRegulated']) finalVal += 'Name,Value,Reglated Value, Unregulated Value, Unit\n';
                    //else finalVal += 'Name,Value,Unit\n';
                    //data.forEach((item) => {
                    //    if (this.studyAreaService.Disclaimers['isRegulated']) finalVal += item.name + ',' + item.value + ',' + item.unRegulatedValue.toFixed(2) + ',' + item.regulatedValue.toFixed(2) + ',' + item.unit + '\n';
                    //    else finalVal += item.name + ',' + item.value + ',' + item.unit + '\n';                   
                    //});
                    return finalVal + '\n';
                };
                var processScenarioParamTable = function (statGroup) {
                    var finalVal = '';
                    statGroup.RegressionRegions.forEach(function (regressionRegion) {
                        //console.log('regression regions loop: ', regressionRegion)
                        //bail if in Area-Averaged section
                        if (regressionRegion.Name == 'Area-Averaged')
                            return;
                        finalVal += statGroup.Name + ' Parameters, ' + regressionRegion.PercentWeight.toFixed(0) + ' Percent  ' + regressionRegion.Name.split("_").join(" ") + '\n';
                        finalVal += 'Name,Value,Min Limit, Max Limit\n';
                        if (regressionRegion.Parameters) {
                            regressionRegion.Parameters.forEach(function (item) {
                                finalVal += item.Name + ',' + item.Value + ',' + item.Limits.Min.toFixed(2) + ',' + item.Limits.Max.toFixed(2) + '\n';
                            });
                        }
                    });
                    return finalVal + '\n';
                };
                var processScenarioFlowTable = function (statGroup) {
                    //console.log('ScenarioFlowTable statGroup: ', statGroup);
                    var finalVal = '';
                    statGroup.RegressionRegions.forEach(function (regressionRegion) {
                        //console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);
                        var regionPercent;
                        if (regressionRegion.PercentWeight)
                            regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                        else
                            regionPercent = '';
                        finalVal += statGroup.Name + ' Flow Report, ' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\n';
                        finalVal += 'Name,Value,Unit,Prediction Error\n';
                        regressionRegion.Results.forEach(function (item) {
                            //console.log('ScenarioFlowTable regressionRegion item: ', item);
                            var unit;
                            if (item.Unit)
                                unit = item.Unit.Abbr;
                            else
                                unit = '';
                            var errors;
                            if (item.Errors)
                                errors = item.Errors[0].Value;
                            else
                                errors = '--';
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
            };
            ReportController.prototype.downloadGeoJSON = function () {
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
            };
            ReportController.prototype.downloadPDF = function () {
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
                        return true;
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
                pdf.fromHTML(source, // HTML string or DOM elem ref.
                margins.left, // x coord
                margins.top, {
                    'width': margins.width,
                    'elementHandlers': specialElementHandlers
                }, function (dispose) {
                    // dispose: object with X, Y of the last line add to the PDF 
                    //          this allow the insertion of new lines after html
                    pdf.save('Test.pdf');
                }, margins);
            };
            ReportController.prototype.loadScenario = function (scenarioCode) {
                console.log(scenarioCode);
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.prototype.initMap = function () {
                this.center = new Center(42, -93, 8);
                this.layers = {
                    baselayers: configuration.basemaps,
                    overlays: {}
                };
                this.geoJSON = {};
                L.Icon.Default.imagePath = 'images';
                this.defaults = {
                    scrollWheelZoom: false,
                    touchZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false
                };
            };
            ReportController.prototype.init = function () {
                var _this = this;
                var sa = this.studyAreaService.studyAreas;
                this._availableScenarioNames = [];
                this._scenarioFlows = [];
                if (Object.keys(sa).length != 0) {
                    for (var key in sa) {
                        sa[key].Scenarios.map(function (s) {
                            if (s.status > 0) {
                                _this._availableScenarioNames.push(s.code.toLowerCase());
                                if (s.result.hasOwnProperty("EstimatedFlow"))
                                    _this._scenarioFlows.push(s.result["EstimatedFlow"]);
                            } //end if 
                        });
                    }
                    ; //next sa
                } //end if
                this.reportTitle = 'StreamEst Report';
                this.reportDate = new Date();
                this.selectedTabName = "studyarea";
                this.initMap();
                this.LoadCitations();
            };
            ReportController.prototype.LoadCitations = function () {
                this.citations = Citations;
            };
            ReportController.prototype.showFeatures = function () {
                var _this = this;
                this.overlays = {};
                this.geoJSON = {};
                var sa = this.studyAreaService.studyAreas;
                if (Object.keys(sa).length === 0)
                    return;
                for (var key in sa) {
                    if (sa[key].status == StreamEst.Models.StudyAreaStatus.e_ready) {
                        sa[key].Features.forEach(function (item) {
                            //console.log('in each loop', item.name);
                            if (item.name == 'globalwatershed') {
                                _this.layers.overlays[item.name] = {
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
                                };
                                var bbox = _this.layers.overlays[item.name].data.features[0].bbox;
                                _this.leafletData.getMap().then(function (map) {
                                    //method to reset the map for modal weirdness
                                    map.invalidateSize();
                                    //console.log('in getmap: ', bbox);
                                    map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                                });
                            }
                            else if (item.name == 'globalwatershedpoint') {
                                _this.layers.overlays[item.name] = {
                                    name: 'Basin Clicked Point',
                                    type: 'geoJSONShape',
                                    data: item.feature,
                                    visible: true,
                                };
                            }
                            else {
                                _this.geoJSON[item.name] = {
                                    data: item.feature
                                };
                            }
                        });
                    } //end if
                }
                ; //next sa
            };
            ReportController.prototype.getScenarioByName = function (scenarioName) {
                var sa = this.studyAreaService.studyAreas;
                if (Object.keys(sa).length == 0)
                    return;
                for (var key in sa) {
                    for (var i = 0; i < sa[key].Scenarios.length; i++) {
                        if (sa[key].Scenarios[i].code.toLowerCase() === scenarioName) {
                            return sa[key].Scenarios[i];
                        } //end if
                    } //next i
                }
                ; //next sa  
            };
            ReportController.prototype.loadGraphData = function (name) {
                var result = [];
                var data;
                switch (name) {
                    case "fdctm":
                        this.setGraphOption(name);
                        var scen = this.getScenarioByName(name);
                        data = [];
                        for (var key in scen.result.ExceedanceProbabilities) {
                            data.push({ label: key, value: scen.result.ExceedanceProbabilities[key] });
                        } //next key
                        result.push({
                            values: data,
                            area: true,
                            color: '#7777ff'
                        });
                        break;
                    case "flow":
                        this.setGraphOption(name);
                        this.scenarioFlows.forEach(function (sf) {
                            data = sf.Observations.map(function (obs) { return { x: new Date(obs.Date).getTime(), y: obs.Value }; });
                            result.push({ key: sf.Name, values: data });
                        }); //next sf
                        break;
                } //end switch
                this.selectedGraphData = result;
                //solves graph width problem
                this.$timeout(function () {
                    window.dispatchEvent(new Event('resize'));
                    //this.fetching = true;
                }, 200);
            };
            ReportController.prototype.setGraphOption = function (graphType) {
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
                                    showMaxMin: false
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
                        };
                        break;
                } //end switch
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.$inject = ['$scope', '$timeout', '$analytics', '$modalInstance', 'StreamEst.Services.StudyAreaService', 'leafletData', 'StreamEst.Services.ModalService'];
            return ReportController;
        })(); //end class
        angular.module('StreamEst.Controllers')
            .controller('StreamEst.Controllers.ReportController', ReportController);
    })(Controllers = StreamEst.Controllers || (StreamEst.Controllers = {}));
})(StreamEst || (StreamEst = {})); //end module
//# sourceMappingURL=ReportController.js.map