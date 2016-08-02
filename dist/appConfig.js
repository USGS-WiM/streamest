var configuration = {}
configuration.baseurls =
{   
    'Service': 'http://services.wim.usgs.gov',
    'NWISurl': 'http://waterservices.usgs.gov/nwis',
    'StreamStats': 'http://streamstats09.cr.usgs.gov',
    'StreamStatsServices':'http://ssdev.cr.usgs.gov',
    'NSS': 'http://toad.wim.usgs.gov/nssservices',
    'SearchAPI': 'http://txpub.usgs.gov/DSS/search_api/1.1/dataService/dataService.ashx',
    'GISserver': 'http://gis.wim.usgs.gov',
    'NodeServer': 'http://nss.wim.usgs.gov',
    'NationalMapRasterServices': 'http://raster.nationalmap.gov/arcgis/rest/services'
}

//override streamstats services URL if on production
if (window.location.origin == 'http://streamstatsags.cr.usgs.gov') configuration.baseurls.StreamStatsServices = 'http://streamstatsags.cr.usgs.gov';

configuration.queryparams =
{
    "NWISsite": '/site/?format=mapper,1.0&stateCd={0}&siteType=GL,OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&hasDataTypeCd=iv',
    'KrigService': '/krigservice/krig?state={0}&xlocation={1}&ylocation={2}&sr={3}',
    'FARefGage': '/arcgis/rest/services/IowaStreamEst/FlowAnywhere/MapServer/1/query?geometry={0}&geometryType=esriGeometryPoint&inSR={1}&spatialRel=esriSpatialRelIntersects&outFields=regions_local.Region_Agg,reference_gages.site_id,reference_gages.site_name,reference_gages.da_gis_mi2,reference_gages.lat_dd_nad,reference_gages.long_dd_na&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
    'RegressionScenarios': '/regressionservice/models/{0}/estimate?state=IA',
    'SSdelineation': '/streamstatsservices/watershed.{0}?rcode={1}&xlocation={2}&ylocation={3}&crs={4}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSwatershedByWorkspace': '/streamstatsservices/watershed.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSeditBasin': '/streamstatsservices/watershed/edit.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSComputeParams': '/streamstatsservices/parameters.json?rcode={0}&workspaceID={1}&includeparameters={2}'
   
}

configuration.basemaps =
{
    //"tnmBaseMap": {
    //    "name": "USGS National Map",
    //    "visible": true,
    //    "type": 'group',
    //    "layerOptions": {
    //        "layers": [
    //            {
    //                "name": "tiles",
    //                "url": "http://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
    //                "type": 'agsTiled',
    //                "layerOptions": {
    //                    "opacity": 0.8,
    //                    "minZoom": 0,
    //                    "maxZoom": 15,
    //                    "attribution": "<a href='http://www.doi.gov'>U.S. Department of the Interior</a> | <a href='http://www.usgs.gov'>U.S. Geological Survey</a> | <a href='http://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
    //                }
    //            },
    //            {
    //                "name": "dynamic",
    //                "url": "http://services.nationalmap.gov/arcgis/rest/services/USGSTopoLarge/MapServer",
    //                "type": 'agsDynamic',
    //                "layerOptions": {
    //                    "format": "png8",
    //                    "f": "image",
    //                    "position": "back",
    //                    "opacity": 0.7,
    //                    "zIndex": -100,
    //                    "minZoom": 16,
    //                    "maxZoom": 20,
    //                    "attribution": "<a href='http://www.doi.gov'>U.S. Department of the Interior</a> | <a href='http://www.usgs.gov'>U.S. Geological Survey</a> | <a href='http://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
    //                }
    //            }
    //        ]
    //    }
    //},
    national: {
        name: "National Geographic",
        type: "agsBase",
        layer: "NationalGeographic",
        visible: true
    },
    streets: {
        name: "ESRI Streets",
        type: "agsBase",
        layer: "Streets",
        visible: true
    },
    topo: {
        name: "ESRI World Topographic",
        type: "agsBase",
        layer: "Topographic",
        visible: false
    },
    oceans: {
        name: "ESRI Oceans",
        type: "agsBase",
        layer: "Oceans",
        visible: false
    },
    gray: {
        name: "ESRI Gray",
        type: "agsBase",
        layer: "Gray",
        visible: false
    },
    imagery: {
        name: "ESRI Imagery",
        type: "agsBase",
        layer: "Imagery",
        visible: false
    },
    "MapquestOAM": {
        "name": "Mapquest Areal",
        "url": "http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",
        "visible": false,
        "type": 'xyz',
        "layerOptions": {
            "maxZoom": 19,
            "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
            "attribution": 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
        }
    },
    "MapquestHYB": {
        "name": "Mapquest Hybrid",
        "type": 'group',
        "visible": false,
        "layerOptions": {
            "maxZoom": 19,
            "layers": [
                {
                    "name": "tiles",
                    "url": "http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg",
                    "type": 'xyz',
                    "layerOptions": {
                        "maxZoom": 19,
                        "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4']
                    }
                },
                {
                    "name": "roads",
                    "url": "http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png",
                    "type": 'xyz',
                    "layerOptions": {
                        "maxZoom": 19,
                        "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
                        "attribution": 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
                    }
                }
            ],
        }
    },
    "mapquestOSM": {
        "name": "Mapquest Streets",
        "url": "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png",
        "visible": false,
        "type": 'xyz',
        "layerOptions": {
            "maxZoom": 19,
            "subdomains": ['otile1', 'otile2', 'otile3', 'otile4'],
            "attribution": "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>. Map data (c) <a href='http://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> contributors, CC-BY-SA."
        }
    }
}// end baselayer

configuration.overlayedLayers = {
    "SSLayer": {
        "name": "Streamgage Layers",
        "url": configuration.baseurls['StreamStats'] + "/arcgis/rest/services/ss_studyAreas_prod/MapServer",
        "type": 'agsDynamic',
        "visible": true,
        "layerOptions": {
            "layers":[0],
            "zIndex": 1,
            "opacity": 0.6,
            "format": "png8",
            "f": "image",
        }
    },//end ssLayer  
    
    "draw": {
        "name": 'draw',
        "type": 'group',
        "visible": true,
        "layerParams": {
            "showOnSelector": false,
        }
    }
}//end overlayedLayers

configuration.regions = {
    IA:{
        'sgrid': {
            "name": "Stream grid",
            "url": configuration.baseurls['StreamStats'] + "/arcgis/rest/services/ia_ss/MapServer",
            "type": 'agsDynamic',
            "visible": true,
            "format": "png8",
            "f":"image",
            "layerOptions": {
                "layers":[2],
                "opacity": 1
            }
        },
        'FLA': {
            "name": "Flow Anywhere Model",
            "url": 'http://gis.wim.usgs.gov/arcgis/rest/services/IowaStreamEst/FlowAnywhere/MapServer',
            "type": 'agsDynamic',
            "visible": true,
            "layerOptions": {
                "opacity": 0.5
            }
        },
        'FDCTM': {
            "name": "Flow Duration Curve Transfer Model",
            "url": 'http://gis.wim.usgs.gov/arcgis/rest/services/IowaStreamEst/FDCTM/MapServer',
            "type": 'agsDynamic',
            "visible": true,
            "layerOptions": {
                "opacity": 0.5
            }
        },
        'PRMS': {
            "name": "PRMS",
            "url": 'http://gis.wim.usgs.gov/arcgis/rest/services/IowaStreamEst/PRMS/MapServer',
            "type": 'agsDynamic',
            "visible": true,
            "layerOptions": {
                "opacity": 0.5
            }
        }
    }
}//end regions
