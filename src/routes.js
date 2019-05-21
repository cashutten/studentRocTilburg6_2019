import * as $ from 'jquery';

/**
 * Check if there's a duplicate route
 * @param allRoutes
 * @param remoteserver
 * @returns {Array}
 */
const checkDuplicate = (allRoutes, route, remoteserver = "") => {
    // "Amelisweerd (OV Stapper)"
    // console.log(allRoutes);
    // console.log(route);
    let found = [],
        counter = 0;
    // console.log(allRoutes);
    for (let i = 0; i < allRoutes.length; i++) {
        console.log(allRoutes[i]);
        if (found.includes(JSON.stringify(route.json.features[0].geometry.coordinates))) {
            // console.log("dupe");
            return true;
        } else {
            found.push(JSON.stringify(allRoutes[i].data.json.features[0].geometry.coordinates));
            // console.log("no dupe");
            counter++;
        }
    }
    return found;
};

/**
 * Read json from remoteserver
 * @param remoteserver
 * @returns {Promise}
 */
const getroutesjson = (remoteserver) => {
    return new Promise((resolve, reject) => { //New promise for array
        let routesjson = [];
        $.ajax({
            type: "GET",
            url: remoteserver,
            dataType: "json"
        })
        .done((data) => {
            routesjson = data.map((f) => {
                return {data: f};
            });
            // console.log(routesjson);
            resolve(routesjson);
        })
        .fail((err) => reject(err));
    });
};

/**
 * Post a textfile to the remoteserver
 * @param remoteserver
 * @param file
 * @returns {Promise}
 */
const posttextfile = (remoteserver = "", file = "", allRoutes = "") => {

    return new Promise((resolve, reject) => { //New promise for array
        const reader = new FileReader();
        //Send contents file when read

        reader.onloadend = (e) => {
            const contents = e.target.result;
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const res = JSON.parse(xhr.response);
                        console.log(res);
                        if(res.error === true || checkDuplicate(allRoutes, res)){
                            reject(res.msg);
                        } else {
                            resolve();
                        }
                    } else {
                        reject("Problem posting " + xhr.status);
                    }
                }
            };

            xhr.open("POST", remoteserver);
            xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
            xhr.send(contents);
        };
        reader.readAsText(file);
    });
};

/**
 * Remove route from server
 * @param remoteserver
 * @param id
 */
const removeRoute = (remoteserver = "", id = "") => {
    
};

/**
 * Get a cuid from the server
 * @param remoteserver
 * @returns {Promise}
 */
const getcuid = (remoteserver) => {
    return fetch(remoteserver)
        .then(response => response.json())
        .catch(err => console.error("Error: ", err));
};

//expose ajax functions
exports.getroutesjson = getroutesjson;
exports.posttextfile = posttextfile;
exports.getcuid = getcuid;
exports.checkDuplicate = checkDuplicate;