import $ from 'jquery';
import Ractive from 'ractive';
import Map from './map';
import {getroutesjson, posttextfile, getcuid} from './routes';

// Hiking app
const hikingapp = (remoteserver) => {
    'use strict';

    //Init
    const ractive_ui = new Ractive({
        el: '#container',
        template: '#template',
        debug: true
    });
    let map = null;
    let satellite = false;

    let cuid = localStorage.getItem("cuid");

    if (!cuid) {
        getcuid(remoteserver + "/cuid")
            .then((res) => {
                localStorage.setItem('cuid', res.cuid);
                cuid = localStorage.getItem('cuid');
            })
            .catch(err => console.error("Error: ", err));
    }

    //Wait until Ractive is ready
    ractive_ui.on('complete', () => {

        //New mapbox-gl map
        map = new Map();
        const geo_options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 3000
        };

        //Get routes from server and show these as choices
        getroutesjson(remoteserver + '/routes?cuid=' + cuid)
            .then(
                (routesjson) => {
                    ractive_ui.set("hikes", routesjson);
                },
                (reason) => {
                    // Error retreiving routes!
                    console.log(reason);
                }
            )
            .catch(
                (e) => {
                    console.log(e);
                }
            )
        ;

        //Update device location on map
        navigator.geolocation.watchPosition(map.geo_success.bind(map), null, geo_options);
    });

    //Events
    ractive_ui.on({
        'collapse': (event, filename, routeobj) => {
            // console.log("yes yes yes");
            //Toggle description
            $(".item").toggle(false);
            $("#route" + filename).toggle(true);
            //Show chosen route on map
            map.showroute(routeobj.data.json);
        },
        'uploadgpx': (event) => {
            const allRoutes = ractive_ui.get("hikes");
            console.log(allRoutes);
            const file = event.original.target.files[0];
            if (file) {
                //Post route (gpx text file) async
                posttextfile(remoteserver + '/upload?cuid=' + cuid, file, allRoutes)
                    .then(() => {
                        //Retreive the latest routes async
                        getroutesjson(remoteserver + '/routes?cuid=' + cuid)
                            .then(
                                (routesjson) => {
                                    console.log(routesjson);
                                    //Show success
                                    $("#info").html("Route is toegevoegd");
                                    ractive_ui.set("hikes", routesjson);
                                    //Show chosen route
                                    map.showroute(routesjson[0].data.json);
                                }
                            )
                            .catch(
                                (reason) => {
                                    //error
                                    $("#info").html(reason);
                                }
                            );
                        }
                    )
                    .catch(
                        (e) => {
                            $("#info").html(e);
                        }
                    );
            }
        },
        'center': () => {
            navigator.geolocation.clearWatch(1);
            navigator.geolocation.getCurrentPosition(map.geo_success.bind(map));
            return;
        },
        'satellite': () => {
            if (satellite) {
                satellite = false;
                map.map.setStyle("mapbox://styles/mapbox/streets-v8");
            } else {
                satellite = true;
                map.map.setStyle("mapbox://styles/mapbox/satellite-v9");
            }
        }
    });
};

//Expose ractive functions
exports.hikingapp = hikingapp;
