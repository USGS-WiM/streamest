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
module StreamEst.Controllers {

    declare var search_api;

    'use strinct';
    interface ISidebarControllerScope extends ng.IScope {
        vm: SidebarController;
    }
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
    }
    interface IDateRange {
        dates: {
            startDate: Date;
            endDate: Date;
        }
        minDate?: Date;
        maxDate?: Date;
    }
    interface ISidebarController {
        sideBarCollapsed: boolean;
        selectedProcedure: ProcedureType;
        setProcedureType(pType: ProcedureType): void;
        toggleSideBar(): void;
        isLoadingScenarios: boolean;
    }
    
    class SidebarController implements ISidebarController {
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-
        private _onSelectedStatisticsGroupChangedHandler: WiM.Event.EventHandler<WiM.Event.EventArgs>;
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sideBarCollapsed: boolean;
        public selectedProcedure: ProcedureType;
        public angulartics: any;
        public AvailableScenarios:Array<Models.IScenario>
        public dateRange: IDateRange;
        private searchService: WiM.Services.ISearchAPIService;
        private studyAreaService: Services.IStudyAreaService;       
        private modalService: Services.IModalService;    
        private multipleParameterSelectorAdd: boolean;
        private explorationService: Services.IExplorationService;
        public isLoadingScenarios: boolean;
        public get ScenariosSelected(): boolean {
            var sa = this.studyAreaService.studyAreas;
            if (Object.keys(sa).length === 0) return false;
            for (var key in sa) {
                if (sa[key].Scenarios.length > 0) {
                    return true;
                }//end if
            };//next sa
            return false;
        }
        public get StudyAreasInitialized(): boolean {
            var sa = this.studyAreaService.studyAreas;
            if (Object.keys(sa).length === 0) return false;
            for (var key in sa) {
                if (sa[key].status < Models.StudyAreaStatus.e_initialized) {
                    return false;
                }//end if
            };//next sa
            return true;
        }
        public get ScenariosReady(): boolean {
            var sa = this.studyAreaService.studyAreas;
            if (Object.keys(sa).length === 0) return false;
            for (var key in sa) {
                if (sa[key].status != Models.StudyAreaStatus.e_ready) return false;
                for (var i = 0; i < sa[key].Scenarios.length; i++) {
                    if (sa[key].Scenarios[i].status <= Models.ScenarioStatus.e_initialized) return false;
                }//next i
            };//next sa
            return true;
        }
        public get selectedParameters(): Array<Models.IParameter> {
            var sa = <Models.IStatisticStudyArea>this.studyAreaService.getStudyArea(Models.StudyAreaType.e_basin);
            if (sa == null) return null;
            return null;//sa.Parameters;
        }
        private _isBuildingReport: boolean;
        public isBuildingReport(): boolean {
            return this._isBuildingReport;
        }
       
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', 'WiM.Services.SearchAPIService', 'StreamEst.Services.StudyAreaService', 'StreamEst.Services.ModalService', 'StreamEst.Services.ExplorationService', 'WiM.Event.EventManager','toaster'];
        constructor($scope: ISidebarControllerScope, $analytics, service: WiM.Services.ISearchAPIService, studyArea: Services.IStudyAreaService, modal: Services.IModalService, exploration: Services.IExplorationService, private EventManager:WiM.Event.IEventManager, private toaster) {
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
            this.dateRange = { dates: { startDate: this.addDay(new Date(), -1), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1)};

            //watch for completion of load parameters
            //$scope.$watch(() => this.studyAreaService.parametersLoaded,(newval, oldval) => {
            //    if (newval == oldval) return;
            //    //console.log('parameters loaded', oldval, newval);
            //    if (newval == null) this.setProcedureType(3);
            //    else this.setProcedureType(4);
            //});

        }

        //Methods
        public getLocations(term: string): ng.IPromise<Array<WiM.Services.ISearchAPIOutput>> {
            return this.searchService.getLocations(term);
        }
        public loadSelectedScenarios() {
            this.isLoadingScenarios = true;
            var evnthandler =new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                this.isLoadingScenarios = false;
                this.EventManager.UnSubscribeToEvent(Services.onStudyAreaLoadComplete, evnthandler);
                this.setProcedureType(ProcedureType.REPORT);
                this.clrm();
                this.sm("Finished Loading Scenarios, continue by configuring the report and selecting continue.", Models.NotificationType.e_success, "Loading Scenarios");
            })
            this.EventManager.SubscribeToEvent(Services.onStudyAreaLoadComplete, evnthandler );
            this.studyAreaService.loadScenarios();
            this.sm("Loading Scenarios. Please wait...", Models.NotificationType.e_wait, "Loading Scenarios", true, 151, 0);
        }
        public setProcedureType(pType: ProcedureType) {    
            //console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));     

            if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) return;
                        
            this.selectedProcedure = pType;
        }
        public toggleSideBar(): void {
            if (this.sideBarCollapsed) this.sideBarCollapsed = false;
            else this.sideBarCollapsed = true;          
        }
        public startSearch(e) {
            e.stopPropagation(); e.preventDefault();
            $("#sapi-searchTextBox").trigger($.Event("keyup", { "keyCode": 13 }));
        }
        public StudyAreaContainsScenario(studyAreaType: Models.StudyAreaType, obj):boolean {
            var sa = this.studyAreaService.getStudyArea(studyAreaType);
            if (sa == null) return false;
            for (var i = 0; i < sa.Scenarios.length; i++) {
                if (angular.equals(sa.Scenarios[i], obj)) {
                    return true;
                }
            };
            return false;
        }        
        public selectScenario(scenario: Models.IScenario) {
            if (this.isLoadingScenarios) { this.sm("Busy Loading parameters.. Please wait.",Models.NotificationType.e_warning,'Warning'); return; }

            //add to studyarea
            if (this.studyAreaService.scenarioExists(scenario))
                this.studyAreaService.removeScenario(scenario);
            else
                this.studyAreaService.addScenario(scenario);

        }
        public showEditableReport() {
            this.modalService.openModal(Services.SSModalType.e_report, {editable:true});
        }
        public generateReport() {   
            if (!this.verifySceneriosCanExecute()) return;
            if (this.studyAreaService.isBusy) return;

            var evntHandler = new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {                
                this.modalService.openModal(Services.SSModalType.e_report);
                this.EventManager.UnSubscribeToEvent(Services.onStudyAreaExcecuteComplete, evntHandler);
            });

            this.EventManager.SubscribeToEvent(Services.onStudyAreaExcecuteComplete, evntHandler);  

            this.studyAreaService.computeScenarios(this.dateRange.dates.startDate,this.dateRange.dates.endDate);

        }
        public getPRMSRiverName(id: string): string {
            return this.studyAreaService.prmsNameLookup[id];
        }
        public resetStudyArea(studyAreaType: Models.StudyAreaType, obj): boolean {
            var sa = this.studyAreaService.getStudyArea(studyAreaType);
            if (sa == null) return false;
            sa.Features.forEach((f) => {
                this.EventManager.RaiseEvent(WiM.Directives.onLayerChanged, this, new WiM.Directives.LegendLayerChangedEventArgs(f.name, "visible", false));
            });
            delete this.studyAreaService.studyAreas[studyAreaType];
            

        }     

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void { 
            //init event handler
            this.AvailableScenarios = [new Models.FDCTMScenario(), new Models.FAScenario(), new Models.PRMSScenario()];
        }
        private canUpdateProcedure(pType: ProcedureType): boolean {
            //console.log('in canUpdateProcedure');
            //Project flow:
            var msg: string;
            try {               
                switch (pType) {
                    case ProcedureType.SEARCH:
                        return true;
                    case ProcedureType.SCENARIO:
                        return true;
                    case ProcedureType.REPORT:
                        //check if scenarios != null;
                        if (this.isLoadingScenarios) { this.sm("Loading scenario parameters please wait.",Models.NotificationType.e_warning,"Warning"); return false; }
                        if (!this.ScenariosSelected) { this.sm("You must first select a scenario to continue.", Models.NotificationType.e_warning, "Warning"); return false; }

                        if (!this.StudyAreasInitialized) {
                            var sa = this.studyAreaService.studyAreas;
                            if (Object.keys(sa).length === 0) this.sm("There are no study areas. First select a scenario.", Models.NotificationType.e_warning, "Warning");
                            for (var key in sa) {
                                if (sa[key].status == Models.StudyAreaStatus.e_empty) this.sm("There is no study area initialized. Select a location to add a study area.", Models.NotificationType.e_warning, "Warning");
                                if (sa[key].status == Models.StudyAreaStatus.e_initialized) this.sm("Study area is initialized. Please wait....", Models.NotificationType.e_warning, "Warning");
                                if (sa[key].status == Models.StudyAreaStatus.e_error) this.sm("There was an error while initializing the study area. Please try again.", Models.NotificationType.e_warning, "Warning");
                            };//next sa
                            return false;
                        }

                        if (!this.ScenariosReady) { this.sm("You must first load the scenarios to continue.", Models.NotificationType.e_warning, "Warning"); return false; }                  
                        return true;
                    default:
                        return false;
                }//end switch          
            }
            catch (e) {
                //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                return false;
            }
        }
        private verifySceneriosCanExecute(): boolean {
            //check dates
            if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                this.sm("Dates are out of range.", Models.NotificationType.e_error, "Error",true);
                return false;
            }
            
            if (!this.studyAreaService.verifyScenariosStatus(Models.ScenarioStatus.e_initialized)) { { this.sm("Scenarios are not initialized.", Models.NotificationType.e_error, "Error",true); return false; }}
            return true;
        }
        private addDay(d: Date, days: number): Date {
            try {
                var dayAsTime: number = 1000 * 60 * 60 * 24;
                return new Date(d.getTime() + days * dayAsTime);
            }
            catch (e) {
                return d;
            }
        }
        
        private sm(m:string, t:Models.NotificationType, title:string ="", showclosebtn:boolean=false, id:number = null, tmout:number =5000 ) {
            this.toaster.pop(new Models.Notification(m, t, title, showclosebtn, tmout, id));
        }
        private clrm(id:number=null){
            this.toaster.clear(id);
        }
    }//end class

    enum ProcedureType {
        SEARCH = 1,
        SCENARIO = 2,
        REPORT = 4
    }

    angular.module('StreamEst.Controllers')
        .controller('StreamEst.Controllers.SidebarController', SidebarController)
    
}//end module
 