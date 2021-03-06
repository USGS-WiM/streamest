//------------------------------------------------------------------------------
//----- SidebarController ------------------------------------------------------
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
var StreamEst;
(function (StreamEst) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var SidebarController = (function () {
            function SidebarController($scope, $analytics, service, studyArea, modal, exploration, EventManager, toaster) {
                this.EventManager = EventManager;
                this.toaster = toaster;
                $scope.vm = this;
                this.init();
                this.angulartics = $analytics;
                this.searchService = service;
                this.sideBarCollapsed = false;
                this.selectedProcedure = ProcedureType.SCENARIO;
                this.studyAreaService = studyArea;
                this.isLoadingScenarios = false;
                this._isBuildingReport = false;
                this.modalService = modal;
                this.explorationService = exploration;
                this.dateRange = { dates: { startDate: this.addDay(new Date(), -1), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                //watch for completion of load parameters
                //$scope.$watch(() => this.studyAreaService.parametersLoaded,(newval, oldval) => {
                //    if (newval == oldval) return;
                //    //console.log('parameters loaded', oldval, newval);
                //    if (newval == null) this.setProcedureType(3);
                //    else this.setProcedureType(4);
                //});
            }
            Object.defineProperty(SidebarController.prototype, "ScenariosSelected", {
                get: function () {
                    var sa = this.studyAreaService.studyAreas;
                    if (Object.keys(sa).length === 0)
                        return false;
                    for (var key in sa) {
                        if (sa[key].Scenarios.length > 0) {
                            return true;
                        } //end if
                    }
                    ; //next sa
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SidebarController.prototype, "StudyAreasInitialized", {
                get: function () {
                    var sa = this.studyAreaService.studyAreas;
                    if (Object.keys(sa).length === 0)
                        return false;
                    for (var key in sa) {
                        if (sa[key].status < StreamEst.Models.StudyAreaStatus.e_initialized) {
                            return false;
                        } //end if
                    }
                    ; //next sa
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SidebarController.prototype, "ScenariosReady", {
                get: function () {
                    var sa = this.studyAreaService.studyAreas;
                    if (Object.keys(sa).length === 0)
                        return false;
                    for (var key in sa) {
                        if (sa[key].status != StreamEst.Models.StudyAreaStatus.e_ready)
                            return false;
                        for (var i = 0; i < sa[key].Scenarios.length; i++) {
                            if (sa[key].Scenarios[i].status <= StreamEst.Models.ScenarioStatus.e_initialized)
                                return false;
                        } //next i
                    }
                    ; //next sa
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SidebarController.prototype, "selectedParameters", {
                get: function () {
                    var sa = this.studyAreaService.getStudyArea(StreamEst.Models.StudyAreaType.e_basin);
                    if (sa == null)
                        return null;
                    return null; //sa.Parameters;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SidebarController.prototype, "isBuildingReport", {
                get: function () {
                    return this._isBuildingReport;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            SidebarController.prototype.getLocations = function (term) {
                return this.searchService.getLocations(term);
            };
            SidebarController.prototype.loadSelectedScenarios = function () {
                var _this = this;
                this.sm("Loading Scenarios. Please wait...", StreamEst.Models.NotificationType.e_wait, "Loading Scenarios", true, 151, 0);
                this.isLoadingScenarios = true;
                var evnthandler = new WiM.Event.EventHandler(function (sender, e) {
                    _this.isLoadingScenarios = false;
                    _this.EventManager.UnSubscribeToEvent(StreamEst.Services.onStudyAreaLoadComplete, evnthandler);
                    _this.setProcedureType(ProcedureType.REPORT);
                    _this.clrm();
                    _this.sm("Finished Loading Scenarios, continue by configuring the report and selecting continue.", StreamEst.Models.NotificationType.e_success, "Loading Scenarios");
                });
                this.EventManager.SubscribeToEvent(StreamEst.Services.onStudyAreaLoadComplete, evnthandler);
                this.studyAreaService.loadScenarios();
            };
            SidebarController.prototype.setProcedureType = function (pType) {
                //console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));     
                if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType))
                    return;
                this.selectedProcedure = pType;
            };
            SidebarController.prototype.toggleSideBar = function () {
                if (this.sideBarCollapsed)
                    this.sideBarCollapsed = false;
                else
                    this.sideBarCollapsed = true;
            };
            SidebarController.prototype.startSearch = function (e) {
                e.stopPropagation();
                e.preventDefault();
                $("#sapi-searchTextBox").trigger($.Event("keyup", { "keyCode": 13 }));
            };
            SidebarController.prototype.StudyAreaContainsScenario = function (studyAreaType, obj) {
                var sa = this.studyAreaService.getStudyArea(studyAreaType);
                if (sa == null)
                    return false;
                for (var i = 0; i < sa.Scenarios.length; i++) {
                    if (angular.equals(sa.Scenarios[i], obj)) {
                        return true;
                    }
                }
                ;
                return false;
            };
            SidebarController.prototype.selectScenario = function (scenario) {
                if (this.isLoadingScenarios) {
                    this.sm("Busy Loading parameters.. Please wait.", StreamEst.Models.NotificationType.e_warning, 'Warning');
                    return;
                }
                //add to studyarea
                if (this.studyAreaService.scenarioExists(scenario))
                    this.studyAreaService.removeScenario(scenario);
                else
                    this.studyAreaService.addScenario(scenario);
            };
            SidebarController.prototype.showEditableReport = function () {
                this.modalService.openModal(StreamEst.Services.SSModalType.e_report, { editable: true });
            };
            SidebarController.prototype.generateReport = function () {
                var _this = this;
                if (!this.verifySceneriosCanExecute())
                    return;
                if (this.studyAreaService.isBusy)
                    return;
                this._isBuildingReport = true;
                var evntHandler = new WiM.Event.EventHandler(function (sender, e) {
                    _this.modalService.openModal(StreamEst.Services.SSModalType.e_report);
                    _this.EventManager.UnSubscribeToEvent(StreamEst.Services.onStudyAreaExcecuteComplete, evntHandler);
                    _this._isBuildingReport = false;
                });
                this.EventManager.SubscribeToEvent(StreamEst.Services.onStudyAreaExcecuteComplete, evntHandler);
                this.studyAreaService.computeScenarios(this.dateRange.dates.startDate, this.dateRange.dates.endDate);
            };
            SidebarController.prototype.getPRMSRiverName = function (id) {
                return this.studyAreaService.prmsNameLookup[id];
            };
            SidebarController.prototype.resetStudyArea = function (studyAreaType) {
                var _this = this;
                var sa = this.studyAreaService.getStudyArea(studyAreaType);
                if (sa == null)
                    return false;
                sa.Features.forEach(function (f) {
                    _this.EventManager.RaiseEvent(WiM.Directives.onLayerChanged, _this, new WiM.Directives.LegendLayerChangedEventArgs(f.name, "visible", false));
                });
                delete this.studyAreaService.studyAreas[studyAreaType];
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.init = function () {
                //init event handler
                this.AvailableScenarios = [new StreamEst.Models.FDCTMScenario(), new StreamEst.Models.FAScenario(), new StreamEst.Models.PRMSScenario()];
            };
            SidebarController.prototype.canUpdateProcedure = function (pType) {
                //console.log('in canUpdateProcedure');
                //Project flow:
                var msg;
                try {
                    switch (pType) {
                        case ProcedureType.SEARCH:
                            return true;
                        case ProcedureType.SCENARIO:
                            return true;
                        case ProcedureType.REPORT:
                            //check if scenarios != null;
                            if (this.isLoadingScenarios) {
                                this.sm("Loading scenario parameters please wait.", StreamEst.Models.NotificationType.e_warning, "Warning");
                                return false;
                            }
                            if (!this.ScenariosSelected) {
                                this.sm("You must first select a scenario to continue.", StreamEst.Models.NotificationType.e_warning, "Warning");
                                return false;
                            }
                            if (!this.StudyAreasInitialized) {
                                var sa = this.studyAreaService.studyAreas;
                                if (Object.keys(sa).length === 0)
                                    this.sm("There are no study areas. First select a scenario.", StreamEst.Models.NotificationType.e_warning, "Warning");
                                for (var key in sa) {
                                    if (sa[key].status == StreamEst.Models.StudyAreaStatus.e_empty)
                                        this.sm("There is no study area initialized. Select a location to add a study area.", StreamEst.Models.NotificationType.e_warning, "Warning");
                                    if (sa[key].status == StreamEst.Models.StudyAreaStatus.e_initialized)
                                        this.sm("Study area is initialized. Please wait....", StreamEst.Models.NotificationType.e_warning, "Warning");
                                    if (sa[key].status == StreamEst.Models.StudyAreaStatus.e_error)
                                        this.sm("There was an error while initializing the study area. Please try again.", StreamEst.Models.NotificationType.e_warning, "Warning");
                                }
                                ; //next sa
                                return false;
                            }
                            if (!this.ScenariosReady) {
                                this.sm("You must first load the scenarios to continue.", StreamEst.Models.NotificationType.e_warning, "Warning");
                                return false;
                            }
                            return true;
                        default:
                            return false;
                    } //end switch          
                }
                catch (e) {
                    //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                    return false;
                }
            };
            SidebarController.prototype.verifySceneriosCanExecute = function () {
                //check dates
                if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                    (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                    (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                    this.sm("Dates are out of range.", StreamEst.Models.NotificationType.e_error, "Error", true);
                    return false;
                }
                if (!this.studyAreaService.verifyScenariosStatus(StreamEst.Models.ScenarioStatus.e_initialized)) {
                    {
                        this.sm("Scenarios are not initialized.", StreamEst.Models.NotificationType.e_error, "Error", true);
                        return false;
                    }
                }
                return true;
            };
            SidebarController.prototype.addDay = function (d, days) {
                try {
                    var dayAsTime = 1000 * 60 * 60 * 24;
                    return new Date(d.getTime() + days * dayAsTime);
                }
                catch (e) {
                    return d;
                }
            };
            SidebarController.prototype.sm = function (m, t, title, showclosebtn, id, tmout) {
                if (title === void 0) { title = ""; }
                if (showclosebtn === void 0) { showclosebtn = false; }
                if (id === void 0) { id = null; }
                if (tmout === void 0) { tmout = 5000; }
                this.toaster.pop(new StreamEst.Models.Notification(m, t, title, showclosebtn, tmout, id));
            };
            SidebarController.prototype.clrm = function (id) {
                if (id === void 0) { id = null; }
                this.toaster.clear(id);
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.$inject = ['$scope', '$analytics', 'WiM.Services.SearchAPIService', 'StreamEst.Services.StudyAreaService', 'StreamEst.Services.ModalService', 'StreamEst.Services.ExplorationService', 'WiM.Event.EventManager', 'toaster'];
            return SidebarController;
        }()); //end class
        var ProcedureType;
        (function (ProcedureType) {
            ProcedureType[ProcedureType["SEARCH"] = 1] = "SEARCH";
            ProcedureType[ProcedureType["SCENARIO"] = 2] = "SCENARIO";
            ProcedureType[ProcedureType["REPORT"] = 4] = "REPORT";
        })(ProcedureType || (ProcedureType = {}));
        angular.module('StreamEst.Controllers')
            .controller('StreamEst.Controllers.SidebarController', SidebarController);
    })(Controllers = StreamEst.Controllers || (StreamEst.Controllers = {}));
})(StreamEst || (StreamEst = {})); //end module
//# sourceMappingURL=SidebarController.js.map