var map;
var previousSelected;
var initial_load = true
function loadMap() {


    map = new mapboxgl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
                }
            },
            layers: [{
                id: 'osm',
                type: 'raster',
                source: 'osm',
            }],
        }
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false
    });

    const listingEl = document.getElementById('feature-listing');

    function renderListings(allFeatures) {
        const features = getUniqueFeatures(allFeatures, 'id');
        const empty = document.createElement('p');
        // Clear any existing listings
        listingEl.innerHTML = '';
        if (features.length) {
            for (const feature of features) {
                var li = document.createElement('li');
                li.innerHTML = "<div id='choice-STO075P04' class='location-card-item' data-id='STO075P04'><div aria-pressed='false' class='hnf-choice-item__action'><span class='location-item__content'><span class='location-item__title'>" + feature.properties.name + "</span><span class='hnf-storelocator__cmp__address'>" + feature.properties.address + "</span><span class='location-phone'>Phone:</span><span>" + feature.properties.phone + "</span><span style='display:block'></span><span class='location-mail'>Mail:</span><span>" + feature.properties.email + "</span><span onclick='showOnMapClick(this.id)' id=" + feature.properties.id + " class='hnf-storelocator__cmp__type'><svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='24' height='24' viewBox='0 0 256 256' xml:space='preserve'><defs></defs><g style='stroke:none;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;fill:none;fill-rule:nonzero;opacity:1' transform='translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)'><path d='M 45 90 c -1.415 0 -2.725 -0.748 -3.444 -1.966 l -4.385 -7.417 C 28.167 65.396 19.664 51.02 16.759 45.189 c -2.112 -4.331 -3.175 -8.955 -3.175 -13.773 C 13.584 14.093 27.677 0 45 0 c 17.323 0 31.416 14.093 31.416 31.416 c 0 4.815 -1.063 9.438 -3.157 13.741 c -0.025 0.052 -0.053 0.104 -0.08 0.155 c -2.961 5.909 -11.41 20.193 -20.353 35.309 l -4.382 7.413 C 47.725 89.252 46.415 90 45 90 z' style='stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;fill:#0488db;fill-rule:nonzero;opacity:1' transform=' matrix(1 0 0 1 0 0) ' stroke-linecap='round'/><path d='M 45 45.678 c -8.474 0 -15.369 -6.894 -15.369 -15.368 S 36.526 14.941 45 14.941 c 8.474 0 15.368 6.895 15.368 15.369 S 53.474 45.678 45 45.678 z' style='stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;fill:#fff;fill-rule:nonzero;opacity:1' transform=' matrix(1 0 0 1 0 0) ' stroke-linecap='round'/></g></svg>Show On Map</span></span></div><span id=border" + feature.properties.id + " class='location-card__border ' aria-hidden='true'></span></div>"
                // li.addEventListener('mouseover', () => {
                //     // Highlight corresponding feature on the map
                //     popup
                //         .setLngLat(feature.geometry.coordinates)
                //         .setText(feature.properties.name)
                //         .addTo(map);

                //     map.setFilter('pins-highlighted', [
                //         'in',
                //         'id',
                //         feature.properties.id
                //     ]);
                // });

                // li.addEventListener('mouseleave', () => {
                //     popup.remove();
                //     map.setFilter('pins-highlighted', ['in', 'id', '']);
                // });


                listingEl.appendChild(li);
            }
            addSelectedStyleToItem(previousSelected)

        } else {
            empty.textContent = 'Drag the map to populate results';
            listingEl.appendChild(empty);
        }
    }

    function normalize(string) {
        return string.trim().toLowerCase();
    }

    // Because features come from tiled vector data,
    // feature geometries may be split
    // or duplicated across tile boundaries.
    // As a result, features may appear
    // multiple times in query results.
    function getUniqueFeatures(features, comparatorProperty) {
        const uniqueIds = new Set();
        const uniqueFeatures = [];
        for (const feature of features) {
            const id = feature.properties[comparatorProperty];
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                uniqueFeatures.push(feature);
            }
        }
        return uniqueFeatures;
    }


    map.on('load', () => {
        map.loadImage(
            './icons/pin-48.png',
            (error, image) => {
                if (error) throw error;

                map.addImage('pin', image);
                map.addSource('locations', {
                    type: 'geojson',
                    data: data_features
                });
                map.addLayer({
                    'id': 'pin',
                    'source': 'locations',
                    'type': 'symbol',
                    'layout': {
                        'icon-image': 'pin', // reference the image
                        'icon-size': 0.35
                    }
                });

                map.addLayer({
                    'id': 'pins-highlighted',
                    'source': 'locations',
                    'type': 'symbol',
                    'layout': {
                        'icon-image': 'pin', // reference the image
                        'icon-size': 0.75
                    },
                    'filter': ['in', 'id', '']
                });

                map.on('moveend', () => {
                    const features = map.queryRenderedFeatures({ layers: ['pin'] });
                    features.push(...map.queryRenderedFeatures({ layers: ['pins-highlighted'] }))
                    if (features) {
                        renderListings(features);
                    }
                });

                map.on('mousemove', 'pin', (e) => {
                    map.getCanvas().style.cursor = 'pointer';

                    // Populate the popup and set its coordinates based on the feature.
                    const feature = e.features[0];
                    popup
                        .setLngLat(feature.geometry.coordinates)
                        .setText(
                            `${feature.properties.name} (${feature.properties.address})`
                        )
                        .addTo(map);
                });

                map.on('mouseleave', 'pin', () => {
                    map.getCanvas().style.cursor = '';
                    popup.remove();
                });

                map.on('sourcedata', (e) => {
                    if (initial_load && e.dataType == "source" && e.isSourceLoaded && e.sourceId == "locations") {
                        var features = e.source.data.features
                        console.log(features)
                        if (features.length > 0) {
                            renderListings(features);
                            map.fitBounds(getBoundingBox(data_features), { padding: 100 })
                            initial_load = false;
                        }

                    }
                });
            });
    });

    map.on('click', function (e) {
        // Set `bbox` as 5px reactangle area around clicked point.
        const bbox = [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5]
        ];
        // Find features intersecting the bounding box.
        const selectedFeatures = map.queryRenderedFeatures(bbox, {
            layers: ['pin']
        });
        if (selectedFeatures.length > 0) {
            highlightCell(selectedFeatures[0].properties.id);
        }
    });

}

function highlightCell(clickedId) {
    console.log("Clicked:", clickedId, "PreviousClicked", previousSelected)
    if (previousSelected) {
        var previousNode = document.getElementById("border" + previousSelected);
        if (previousNode) {
            previousNode.classList.remove("selected");
        }
    }
    addSelectedStyleToItem(clickedId)

    map.setFilter('pins-highlighted', [
        'in',
        'id',
        clickedId
    ]);
    previousSelected = clickedId;
}

function showOnMapClick(clickedId) {
    highlightCell(clickedId)
}

function getBoundingBox(data) {
    var bounds = { xMin: 0 }, coords, point, latitude, longitude;

    for (var i = 0; i < data.features.length; i++) {
        coords = data.features[i].geometry.coordinates;


        for (var j = 0; j < coords.length; j++) {
            longitude = coords[0];
            latitude = coords[1];
            bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
            bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
            bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
            bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
        }

    }
    var l = [[bounds.xMin, bounds.yMin]]
    l.push([bounds.xMax, bounds.yMax])
    return l;
}


function addSelectedStyleToItem(id) {
    if (id) {
        var borderNode = document.getElementById("border" + id)
        if (borderNode) {
            borderNode?.classList.add("selected");
            borderNode?.parentNode.parentNode.scrollIntoView();
        }
    }
}