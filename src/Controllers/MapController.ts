//------------------------------------------------------------------------------
//----- MapController ----------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//04.15.2015 jkn - Created

//Imports"
module StreamEst.Controllers {

    declare var greinerHormann;
    declare var ga;

    'use strict';
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
        getLayers(): ng.IPromise<any>;
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IBounds {
        southWest: IMapPoint;
        northEast: IMapPoint;
    }
    interface IMapPoint {
        lat: number;
        lng: number;
    }
    interface IMapLayers {
        baselayers: Object;
        overlays: ILayer;
        //markers: Object;
        //geojson: Object;
    }
    interface ILayer {
        name: string;
        url: string;
        type: string;
        visible: boolean;
        layerOptions: Object;
    }
    interface IMapDefault {
        maxZoom: number;
        zoomControl: boolean;
        minZoom: number;
    }
    interface IMapController {
        center: ICenter;
        layers: IMapLayers;
        controls: Object;
        markers: Object;
        bounds: Object;
        geojson: Object;
        layercontrol: Object;

    }
    interface IMapControllerScope extends ng.IScope {
        vm: MapController;
    }

    class MapPoint implements IMapPoint {
        lat: number;
        lng: number;
        constructor() {
            this.lat = 0;
            this.lng = 0;
        }
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
    class Layer implements ILayer {
        public name: string;
        public url: string;
        public type: string;
        public visible: boolean;
        public layerOptions: Object;

        public constructor(nm: string, ul: string, ty: string, vis: boolean, op: Object = undefined) {
            this.name = nm;
            this.url = ul;
            this.type = ty;
            this.visible = vis;
            this.layerOptions = op;

        }
    }
    class MapDefault implements IMapDefault {
        public maxZoom: number;
        public zoomControl: boolean;
        public minZoom: number;

        constructor(mxZm: number = null, mnZm: number = null, zmCtrl: boolean = true) {
            this.maxZoom = mxZm;
            this.minZoom = mnZm;
            this.zoomControl = zmCtrl;
        }
    }

    class MapController implements IMapController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private searchService: WiM.Services.ISearchAPIService;
        private leafletBoundsHelperService: any;
        private $locationService: ng.ILocationService;
        private leafletData: ILeafletData;
        private studyAreaService: Services.IStudyAreaService;
        private explorationService: Services.IExplorationService;
        private eventManager: WiM.Event.IEventManager;
        private $compile: ng.ICompileService;

        public cursorStyle: string;
        public center: ICenter = null;
        public layers: IMapLayers = null;
        public mapDefaults: IMapDefault = null;
        public mapPoint: IMapPoint = null;
        public bounds: IBounds = null;

        public controls: any;
        public markers: Object = null;
        public geojson: Object = null;
        public events: Object = null;
        public layercontrol: Object = null;
        public regionLayer: Object = null;
        public drawControl: any;
        public angulartics: any;
        public doDelineate: boolean = false;
        public doQueryPRMSSegments: boolean = false;
        private _mapScale: string;
        public get mapScale():string {
            return this._mapScale;
        };

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$compile', '$analytics', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamEst.Services.StudyAreaService', 'StreamEst.Services.ExplorationService', 'WiM.Event.EventManager','toaster'];
        constructor(public $scope: IMapControllerScope, $compile, $analytics, $location: ng.ILocationService, $stateParams, leafletBoundsHelper: any, leafletData: ILeafletData, search: WiM.Services.ISearchAPIService, studyArea: Services.IStudyAreaService, exploration: Services.IExplorationService, eventManager:WiM.Event.IEventManager, private toaster) {
            $scope.vm = this;
            this.init();
            this.$compile = $compile;
            this.angulartics = $analytics;
            this.searchService = search;
            this.$locationService = $location;
            this.leafletBoundsHelperService = leafletBoundsHelper;
            this.leafletData = leafletData;
            this.studyAreaService = studyArea;
            this.explorationService = exploration;
            this.eventManager = eventManager;

            //subscribe to Events
            this.eventManager.SubscribeToEvent(Services.onSelectedStudyAreaChanged, new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                this.onSelectedStudyAreaChanged(sender, e);
            }));
            this.eventManager.SubscribeToEvent(Services.onStudyAreaDoInit, new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                this.onStudyAreaDoInit(sender, e);
            }));
            this.eventManager.SubscribeToEvent(WiM.Directives.onLayerChanged, new WiM.Event.EventHandler<WiM.Directives.LegendLayerChangedEventArgs>((sender, e) => {
                this.onLayerChanged(sender,e);
            }));            
            this.eventManager.SubscribeToEvent(WiM.Services.onSelectedAreaOfInterestChanged, new WiM.Event.EventHandler<WiM.Event.EventArgs>((sender: any, e: WiM.Services.SearchAPIEventArgs) => {
                this.onSelectedAreaOfInterestChanged(sender, e);
            })); 
       
            $scope.$on('leafletDirectiveMap.mousemove',(event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.lng = latlng.lng;
            });
            $scope.$on('leafletDirectiveMap.drag',(event, args) => {
                this.cursorStyle = 'grabbing';
            });
            $scope.$on('leafletDirectiveMap.dragend',(event, args) => {
                if (this.doDelineate || this.doQueryPRMSSegments) this.cursorStyle = 'crosshair';
                else this.cursorStyle = 'pointer';
            });
            $scope.$on('leafletDirectiveMap.zoomend', (event, args) => {
                if (this.doDelineate || this.doQueryPRMSSegments) this.cursorStyle = 'crosshair';
            });
            $scope.$on('leafletDirectiveMap.click', (event, args) => {
                var even = event;
                //listen for delineate click if ready
                if (this.doDelineate) this.checkDelineatePoint(args.leafletEvent.latlng);
                if (this.doQueryPRMSSegments) this.checkPRMSSegment(args.leafletEvent.latlng);

                //query streamgages
                //console.log('map click listener: ', exploration.allowStreamgageQuery);
                if (exploration.allowStreamgageQuery) this.queryStreamgages(args.leafletEvent);

                //state or region layer query
                //if (!region.selectedRegion && !exploration.drawElevationProfile && !exploration.drawMeasurement && !exploration.allowStreamgageQuery) this.queryNationalMapLayers(args.leafletEvent)
            });
            $scope.$watch(() => this.explorationService.elevationProfileGeoJSON,(newval, oldval) => {
                if (newval) this.displayElevationProfile()
            });
            $scope.$watch(() => this.explorationService.drawElevationProfile,(newval, oldval) => {
                if (newval) this.elevationProfile();
            });
            $scope.$watch(() => this.explorationService.drawMeasurement,(newval, oldval) => {
                //console.log('measurementListener ', newval, oldval);
                if (newval) this.measurement();
            });
            $scope.$watch(() => this.doDelineate || this.doQueryPRMSSegments, (newval, oldval) => newval ? this.cursorStyle = 'crosshair' : this.cursorStyle = 'pointer');
            $scope.$watch(() => this.center.zoom, (newval, oldval) => {
                switch (newval) {
                    case 19: this._mapScale = '1,128'; break;
                    case 18: this._mapScale = '2,256'; break;
                    case 17: this._mapScale = '4,513'; break;
                    case 16: this._mapScale = '9,027'; break;
                    case 15: this._mapScale = '18,055'; break;
                    case 14: this._mapScale = '36,111'; break;
                    case 13: this._mapScale = '72,223'; break;
                    case 12: this._mapScale = '144,447'; break;
                    case 11: this._mapScale = '288,895'; break;
                    case 10: this._mapScale = '577,790'; break;
                    case 9: this._mapScale = '1,155,581'; break;
                    case 8: this._mapScale = '2,311,162'; break;
                    case 7: this._mapScale = '4,622,324'; break;
                    case 6: this._mapScale = '9,244,649'; break;
                    case 5: this._mapScale = '18,489,298'; break;
                    case 4: this._mapScale = '36,978,596'; break;
                    case 3: this._mapScale = '73,957,193'; break;
                    case 2: this._mapScale = '147,914,387'; break;
                    case 1: this._mapScale = '295,828,775'; break;
                    case 0: this._mapScale = '591,657,550'; break;
                }
            });

            if ($stateParams.workspaceID) {
                this.studyAreaService.loadStudyArea($stateParams.workspaceID);
            }

        }//end constructor

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public removeStudyArea() {
            if (confirm("This will remove the Study area and contained scenarios. Select OK to proceed.")) {
                this.studyAreaService.removeStudyArea(Models.StudyAreaType.e_basin);
                this.removeGeoJson("globalwatershed", true);
                this.eventManager.RaiseEvent(Services.onStudyAreaRemoved, this, Services.StudyAreaEventArgs.Empty)
            }
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void { 

            //init map           
            this.center = new Center(42, -93, 8);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: configuration.overlayedLayers
            }
            this.mapDefaults = new MapDefault(null, 8, true);
            this.markers = {};
            this.geojson = {};
            this.regionLayer = {};     
            this.controls = {
                scale: true,
                draw: {
                    draw: {
                        polygon: false,
                        polyline: false,
                        rectangle: false,
                        circle: false,
                        marker: false
                    }

                },
                custom:
                new Array(
                    //zoom home button control
                    //(<any>L.Control).zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }),
                    //location control
                    (<any>L.control).locate({ follow: false, locateOptions: {"maxZoom": 15} }),
                    (<any>L.control).elevation({ imperial: true })
                    )
            };
            this.events = {
                map: {
                    enable: ['mousemove', 'zoomend','click']
                }
            }
            this.mapPoint = new MapPoint();
            L.Icon.Default.imagePath = 'images';
        }    
        private initiateStreamgageQuery() {

            //change cursor here if needed

            this.explorationService.allowStreamgageQuery = !this.explorationService.allowStreamgageQuery;  
        }
        private queryStreamgages(evt) {

            //console.log('in query regional layers');
            this.sm("Querying streamgages, Please wait...", Models.NotificationType.e_wait, "Streamgage Query", true, 321, 0);
            
            this.cursorStyle = 'wait';
            this.markers = {};

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'queryStreamgages' });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //check to make sure layer is visible
                    if (map.getZoom() <= 8) {
                        this.cursorStyle = 'pointer';
                        this.clrm(321);
                        this.sm("You must be at Zoom Level 9 or greater to query streamgages", Models.NotificationType.e_warning, "Streamgage Query");
                        return;
                    }

                    //get layer to query
                    var layerString;
                    //this.regionServices.nationalMapLayerList.forEach((item) => {
                    //    if (item[0].toLowerCase() == "streamgages") layerString = '"' + item[1] + '"';
                    //});

                    maplayers.overlays["SSLayer"].identify().on(map).at(evt.latlng).returnGeometry(false).tolerance(5).layers(layerString).run((error: any, results: any) => {

                        this.clrm(321);
                        this.cursorStyle = 'pointer';
                        //console.log('gage query response', results);

                        if (!results.features || results.features.length == 0) {
                            this.sm("No streamgages wer found", Models.NotificationType.e_info, "Streamgage Query");
                            return;
                        }

                        results.features.forEach((queryResult) => {

                            var popupContent = '';
                            var popupKeyList = ['latitude', 'longitude', 'sta_id', 'sta_name', 'featureurl', 'drnarea'];

                            angular.forEach(queryResult.properties, function (value, key) {
                                if (popupKeyList.indexOf(key) != -1) {
                                    if (key == "featureurl") {

                                        var siteNo = value.split('site_no=')[1];

                                        popupContent += '<strong>NWIS page: </strong><a href="' + value + ' "target="_blank">link</a></br>';

                                    }
                                    else popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                                }
                            });

                            this.markers['regionalQueryResult'] = {
                                lat: evt.latlng.lat,
                                lng: evt.latlng.lng,
                                message: popupContent,
                                focus: true,
                                draggable: false
                            };

                            map.panBy([0, 1]);
                            this.clrm(321);

                        });
                    });
                });
            });
        }
        private elevationProfile() {

            document.getElementById('measurement-div').innerHTML = '';
            this.explorationService.measurementData = '';
            this.explorationService.showElevationChart = true;

            var el;

            //get reference to elevation control
            this.controls.custom.forEach((control) => {
                if (control._container.className.indexOf("elevation") > -1) el = control;
            });

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'elevationProfile' });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //create draw control
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();

                    this.drawController({ metric: false }, true);

                    delete this.geojson['elevationProfileLine3D'];

                    map.on('draw:drawstart',(e) => {
                        //console.log('in draw start');
                        el.clear();
                    });

                    //listen for end of draw
                    map.on('draw:created',(e) => {

                        map.removeEventListener('draw:created');

                        var feature = e.layer.toGeoJSON();
			
                        //convert to esriJSON
                        var esriJSON = '{"geometryType":"esriGeometryPolyline","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polyline", "paths":[' + JSON.stringify(feature.geometry.coordinates) + ']}}]}'

                        //make the request
                        this.cursorStyle = 'wait'
                        this.sm("Querying the elevation service. Please wait...", Models.NotificationType.e_wait, "Elevation Query", true, 441, 0);
                        this.explorationService.elevationProfile(esriJSON)

                        //disable button 
                        this.explorationService.drawElevationProfile = false;

                        //force map refresh
                        map.panBy([0, 1]);
                    }); 
                });
            });
        }
        private drawController(options: Object, enable: boolean) {
            //console.log('in drawcontroller: ', options, enable);

            if (!enable) {               
                this.drawControl.disable();
                this.drawControl = undefined;
                //console.log('removing drawControl', this.drawControl);
                return;
            }
            this.leafletData.getMap().then((map: any) => {
                //console.log('enable drawControl');
                this.drawControl = new (<any>L).Draw.Polyline(map, options);
                this.drawControl.enable();
            });
        }
        private displayElevationProfile() {

            //get reference to elevation control
            var el;
            this.controls.custom.forEach((control) => {
                if (control._container && control._container.className.indexOf("elevation") > -1) el = control;
            });

            //parse it
            this.geojson["elevationProfileLine3D"] = {
                data: this.explorationService.elevationProfileGeoJSON,
                style: {
                    "color": "#ff7800",
                    "weight": 5,
                    "opacity": 0.65
                },
                onEachFeature: el.addData.bind(el)
            }

            this.leafletData.getMap().then((map: any) => {
                var container = el.onAdd(map);
                document.getElementById('elevation-div').innerHTML = '';
                document.getElementById('elevation-div').appendChild(container);
            });

            this.clrm(441);
            this.cursorStyle = 'pointer'
        }
        private showLocation() {

            //get reference to location control
            var lc;
            this.controls.custom.forEach((control) => {
                if (control._container.className.indexOf("leaflet-control-locate") > -1) lc = control; 
            });
            lc.start();
        }
        private resetMap() {
            this.center = new Center(42, -93, 8);
        }
        private resetExplorationTools() {
            document.getElementById('elevation-div').innerHTML = '';
            document.getElementById('measurement-div').innerHTML = '';
            if (this.drawControl) this.drawController({ }, false);
            this.explorationService.allowStreamgageQuery = false;
            this.explorationService.drawMeasurement = false;
            this.explorationService.measurementData = '';
            this.explorationService.drawElevationProfile = false;
            this.explorationService.showElevationChart = false;
        }
        private measurement() {

            //console.log('in measurement tool');

            document.getElementById('elevation-div').innerHTML = '';
            //user affordance
            this.explorationService.measurementData = 'Click the map to begin\nDouble click to end the Drawing';

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'measurement' });

            this.leafletData.getMap().then((map: any) => {
                //console.log('got map: ', map);
                this.leafletData.getLayers().then((maplayers: any) => {
                    //console.log('got maplayers: ', maplayers);
                    var stopclick = false; //to prevent more than one click listener

                    this.drawController({shapeOptions: { color: 'blue' }, metric: false }, true);

                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();
			
                    //listeners active during drawing
                    var measuremove = () => {
                        this.explorationService.measurementData = "Total length: " + this.drawControl._getMeasurementString();
                    };
                    var measurestart = () => {
                        if (stopclick == false) {
                            stopclick = true;
                            this.explorationService.measurementData = "Total Length: ";
                            map.on("mousemove", measuremove);
                        };
                    };

                    var measurestop = (e) => {
                        var layer = e.layer;
                        drawnItems.addLayer(layer);
                        drawnItems.addTo(map);
			
                        //reset button
                        this.explorationService.measurementData = "Total length: " + this.drawControl._getMeasurementString();
                        //remove listeners
                        map.off("click", measurestart);
                        map.off("mousemove", measuremove);
                        map.off("draw:created", measurestop);

                        this.drawControl.disable();
                        this.explorationService.drawMeasurement = false;
                    };

                    map.on("click", measurestart);
                    map.on("draw:created", measurestop);


                });
            });
        }
        private checkDelineatePoint(latlng) {

            //console.log('in check delineate point');
            if (this.center.zoom < 15) {this.sm("Please zoom to zoom level of 15 to perform this operation.", Models.NotificationType.e_warning); return;}
            this.sm("Delineating study area. Please wait.....", Models.NotificationType.e_wait, "", true, 579, 0);
            this.cursorStyle = 'wait';
            this.markers = {};

            //put pourpoint on the map
            this.markers['pourpoint'] = {
                lat: latlng.lat,
                lng: latlng.lng,
                message: 'Delineating your click point.</br>Please wait....</br><strong>Latitude: </strong>' + latlng.lat.toFixed(5) + '</br><strong>Longitude: </strong>' + latlng.lng.toFixed(5) + '</br><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>',
                focus: true,
                draggable: false
            }
            //turn off delineate flag
            this.doDelineate = false;
            this.startDelineate(latlng);
        }
        private checkPRMSSegment(latlng) {
            if (this.studyAreaService.getStudyArea(Models.StudyAreaType.e_segment).status == Models.StudyAreaStatus.e_ready) {
                this.doQueryPRMSSegments = false;
                return;
            }

            //console.log('in check delineate point');
            //console.log('in query regional layers');
            this.sm("Querying PRMS segment, Please wait...", Models.NotificationType.e_wait, "Query PRMS segment", true, 603, 0);
            this.cursorStyle = 'wait';          

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'queryStreamgages' });
            

                this.leafletData.getMap().then((map: any) => {
                    this.leafletData.getLayers().then((maplayers: any) => {
                        try {
                            //check to make sure layer is visible
                            if (map.getZoom() <= 8) {
                                this.cursorStyle = 'pointer';
                                this.clrm(603);
                                this.sm("Please zoom to at least a zoom level of 9 to perform this operation", Models.NotificationType.e_warning, 'Query PRMS segment');
                             
                                return;
                            }

                            //get layer to query
                            var layerString;
                            //this.regionServices.nationalMapLayerList.forEach((item) => {
                            //    if (item[0].toLowerCase() == "streamgages") layerString = '"' + item[1] + '"';
                            //});

                            maplayers.overlays["PRMS Segments"].identify().on(map).at(latlng).returnGeometry(true).tolerance(5).layers(layerString).run((error: any, results: any) => {
                                this.clrm(603);
                                //console.log('gage query response', results);

                                if (!results.features || results.features.length == 0) {
                                    this.sm("No segments were found", Models.NotificationType.e_info, "Query PRMS segment");
                                    return;
                                }
                                var sa: Models.SegmentStudyArea = <Models.SegmentStudyArea>this.studyAreaService.getStudyArea(Models.StudyAreaType.e_segment);

                                results.features.forEach((queryResult) => {
                                    var prmsscen = sa.Scenarios[0];
                                    if (queryResult.geometry.type === 'LineString') {
                                        prmsscen.SelectedSegmentList.push({ SegmentID: queryResult.id, RiverID: queryResult.layerId, feature: queryResult.geometry })
                                        this.addGeoJSON("PRMSSeg_" + queryResult.layerId + "." + queryResult.id, queryResult.geometry);
                                        prmsscen.status = Models.ScenarioStatus.e_loaded;
                                    }//end if                                                    
                                });//next feature
                                sa.status = Models.StudyAreaStatus.e_initialized;
                            });
                            
                        }
                        catch (e) {
                            console.log('error', e)
                        }
                        finally {
                            this.cursorStyle = 'pointer';
                            this.clrm(603);
                        }
                    });
                });
            
        }
        private basinEditor() {

            if (this.geojson['globalwatershed'].data.features.length > 1) {
                this.sm("You cannot edit a global watershed", Models.NotificationType.e_warning,"Edit Watershed");
                return;
            }

            var basin = angular.fromJson(angular.toJson(this.geojson['globalwatershed'].data.features[0]));
            var basinConverted = [];
            basin.geometry.coordinates[0].forEach((item) => { basinConverted.push([item[1], item[0]]) });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //console.log('maplayers', map, maplayers);

                    //create draw control
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();
                    var drawControl = new (<any>L).Draw.Polygon(map, drawnItems);
                    drawControl.enable();

                    //listen for end of draw
                    map.on('draw:created', (e) => {

                        map.removeEventListener('draw:created');

                        var layer = e.layer;
                        drawnItems.addLayer(layer);

                        //convert edit polygon coords
                        var editArea = layer.toGeoJSON().geometry.coordinates[0];
                        var editAreaConverted = [];
                        editArea.forEach((item) => { editAreaConverted.push([item[1], item[0]]) });

                        var sourcePolygon = L.polygon(basinConverted);
                        var clipPolygon = L.polygon(editAreaConverted);

                        //if (this.studyArea.drawControlOption == 'add') {
                        //    //console.log('add layer', layer.toGeoJSON());
                        //    var editPolygon = greinerHormann.union(sourcePolygon, clipPolygon);
                        //    this.studyArea.WatershedEditDecisionList.append.push(layer.toGeoJSON());
                        //    //this.studyArea.Disclaimers['isEdited'] = true;
                        //}

                        //if (this.studyArea.drawControlOption == 'remove') {
                        //    //console.log('remove layer', layer.toGeoJSON());
                        //    var editPolygon = greinerHormann.diff(sourcePolygon, clipPolygon);

                        //    //check for split polygon
                        //    //console.log('editPoly', editPolygon.length);
                        //    if (editPolygon.length == 2) {
                        //        alert('Splitting polygons is not permitted');
                        //        drawnItems.clearLayers();
                        //        return;
                        //    }

                        //    this.studyArea.WatershedEditDecisionList.remove.push(layer.toGeoJSON());
                        //    //this.studyArea.Disclaimers['isEdited'] = true;
                        //}

                        //set studyArea basin to new edited polygon
                        basin.geometry.coordinates[0] = [];
                        //editPolygon.forEach((item) => { basin.geometry.coordinates[0].push([item[1], item[0]]) });
                        //console.log('edited basin', basin);
                        
                        //show new polygon
                        this.geojson['globalwatershed'].data.features[0] = basin;
                        drawnItems.clearLayers();
                        //console.log('editedAreas', angular.toJson(this.studyArea.WatershedEditDecisionList));
                    });
                });
            });
        }          
        private addGeoJSON(LayerName: string, feature: any) {

            if (LayerName == 'globalwatershed') {              
                this.geojson[LayerName] =
                {
                    data: feature,
                    style: {
                        //https://www.base64-image.de/
                        displayName: "Basin Boundary",
                        imagesrc: "data:image/png;base64,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",
                        fillColor: "yellow",
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.5
                    }
                }
            }
            else if (LayerName == 'globalwatershedpoint') {
                var sa = this.studyAreaService.getStudyArea(Models.StudyAreaType.e_basin);
                var lat = (<Models.IStatisticStudyArea>sa).Pourpoint.Latitude;
                var lng = (<Models.IStatisticStudyArea>sa).Pourpoint.Longitude;
                var rcode = (<Models.IStatisticStudyArea>sa).RegionID;
                var workspaceID = (<Models.IStatisticStudyArea>sa).WorkspaceID;
                var properties = feature.features[0].properties;

                this.geojson[LayerName] = {
                    data: feature,
                    onEachFeature: (feature, layer) => {
                        var strVar = "         <div>"; 
                            strVar += "        <strong>Latitude: <\/strong>"+lat;
                            strVar += "        <br \/>";
                            strVar += "        <strong>Longitude: <\/strong>"+lng;
                            strVar += "        <br \/>";
                            strVar += "        <strong>WorkspaceID: <\/strong>"+workspaceID;
                            strVar += "        <br \/>";
                            angular.forEach(feature.properties, function (value, key) {
                                strVar += '<strong>' + key + ': </strong>' + value + '<br \/>';
                            });
                            strVar += "       <button class=\"btn-wim-sm btn-wim-danger\" ng-click=\" vm.removeStudyArea()\"><i class='fa fa-close'></i>  Remove Study Area<\/button>";
                            strVar += "        <\/div>";
                    var linkFn = this.$compile(strVar);
                    var content = linkFn(this.$scope);
                    layer.bindPopup(content[0]);
                    },
                    style: {
                        displayName: "Basin Clicked Point",
                        imagesrc: "data:image/png;base64,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",
                        visible: true
                    }
                }
            }

            else {
                this.geojson[LayerName] =
                {
                    data: feature,
                    onEachFeature: (feature, layer) => {
                        layer.bindLabel(LayerName, { noHide: true })
                    }
                }
            }


        }
        private removeGeoJson(layerName: string = "", isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(layerName, this.geojson, isPartial);

            layeridList.forEach((item) => {
                //console.log('removing map overlay layer: ', item);
                delete this.geojson[item];
                this.eventManager.RaiseEvent(WiM.Directives.onLayerRemoved, this, new WiM.Directives.LegendLayerRemovedEventArgs(item, "geojson")); 
            });
        }
        private addOverlayLayers(layerName: string, layer: ILayer) {
            this.layers.overlays[layerName] = layer;
        }
        private removeOverlayLayers(name: string, isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(name, this.layers.overlays, isPartial);

            layeridList.forEach((item) => {
                //console.log('removing map overlay layer: ', item);
                delete this.layers.overlays[item];
            });
        }
        private getLayerIdsByName(name: string, layerObj: Object, isPartial: boolean): Array<string> {
            var layeridList: Array<string> = [];

            for (var variable in layerObj) {
                if (layerObj[variable].hasOwnProperty("name") && (isPartial ? (layerObj[variable].name.indexOf(name) > -1) : (layerObj[variable].name === name))) {
                    layeridList.push(variable);
                }
            }//next variable
            return layeridList;
        }
        private getLayerIdsByID(id: string, layerObj: Object, isPartial: boolean): Array<string> {
            var layeridList: Array<string> = [];

            for (var variable in layerObj) {
                if (isPartial ? (variable.indexOf(id) > -1) : (variable === id)) {
                    layeridList.push(variable);
                }
            }//next variable
            return layeridList;
        }
        private startDelineate(latlng: any) {
            //console.log('in startDelineate', latlng);
            var sa = this.studyAreaService.getStudyArea(Models.StudyAreaType.e_basin) as Models.StudyArea;
            sa.RegionID = "IA";
            sa.Pourpoint = new WiM.Models.Point(latlng.lat, latlng.lng, '4326');

            this.studyAreaService.initializeStudyArea(Models.StudyAreaType.e_basin);
        }

        private sm(m: string, t: Models.NotificationType, title: string = "", showclosebtn: boolean = false, id: number = null, tmout: number = 5000) {
            this.toaster.pop(new Models.Notification(m, t, title, showclosebtn, tmout, id));
        }
        private clrm(id: number = null) {
            this.toaster.clear();
        }

        private onSelectedStudyAreaChanged(sender: any, e: Services.StudyAreaEventArgs) {

            //console.log('in onSelectedStudyAreaChanged');
            e.studyArea.Features.forEach((item) => {
                this.removeGeoJson(item.name);
                this.addGeoJSON(item.name, item.feature);
                this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs(item.name, "geojson", this.geojson[item.name].style));
            });

            //clear out this.markers
            this.markers = {};

            var bbox = this.geojson['globalwatershed'].data.features[0].bbox;
            this.leafletData.getMap().then((map: any) => {
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
                });
            });
            this.clrm();

        }
        private onSelectedAreaOfInterestChanged(sender: any, e: WiM.Services.SearchAPIEventArgs) {

            //ga event
            this.angulartics.eventTrack('Search', { category: 'Sidebar' });

            this.markers = {};
            var AOI = e.selectedAreaOfInterest;

            if (AOI.Category == "U.S. State or Territory") var zoomlevel = 9;
            else var zoomlevel = 14;

            this.markers['AOI'] = {
                lat: AOI.Latitude,
                lng: AOI.Longitude,
                message: AOI.Name,
                focus: true,
                draggable: false
            }

            //this.center = new Center(AOI.Latitude, AOI.Longitude, zoomlevel);

            this.leafletData.getMap().then((map: any) => {
                map.setView([AOI.Latitude, AOI.Longitude], zoomlevel)
            });
        }
        private onLayerChanged(sender: WiM.Directives.IwimLegendController, e: WiM.Directives.LegendLayerChangedEventArgs) {
            if (e.PropertyName === "visible") {
                if (!e.Value)
                    delete this.geojson[e.LayerName];
                else {
                    //get feature

                    var features = this.studyAreaService.getstudyAreaFeatures(e.LayerName);

                    for (var i = 0; i < features.length; i++) {
                        var item = features[i];
                        if (item.name == e.LayerName)
                            this.addGeoJSON(e.LayerName, item.feature);
                    }//next
                }//end if  
            }//end if
        }
        private onStudyAreaDoInit(sender: any, e: Services.StudyAreaEventArgs) {
            var sa = e.studyArea;
            switch (sa.studyAreaType) {
                case Models.StudyAreaType.e_basin:
                    this.addOverlayLayers("Stream Grid", configuration.regions.IA.sgrid);
                    this.doDelineate = true;
                    if (this.doQueryPRMSSegments) this.doQueryPRMSSegments = false;
                    break;
                case Models.StudyAreaType.e_segment:
                    this.addOverlayLayers("PRMS Segments", configuration.regions.IA.PRMS);
                    this.doQueryPRMSSegments = true;
                    if (this.doDelineate) this.doDelineate = false;
                    break;
            }//end switch                       
        }

    }//end class

    angular.module('StreamEst.Controllers')
        .controller('StreamEst.Controllers.MapController', MapController)
}//end module
 