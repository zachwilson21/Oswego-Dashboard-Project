mapboxgl.accessToken = // new style url
  "pk.eyJ1IjoibmR3b2xmMTk5MSIsImEiOiJjbDA4aGppczcwM2kzM2pxdHZydmdsYm5yIn0.ZPuI0T1FxHGAJu_wklsSXg"; // public token, not able to make changes to map itself with it
// only access style layer etc.
const _bounds = 0.5;
const flyToZoom = 18; // maximum zoom level after FlyToZoom is initialized when interacting with building icons

const map = new mapboxgl.Map({
  // creates Mapbox object
  container: "map", // container ID
  style: "mapbox://styles/ndwolf1991/cl1f5gcur004t15mf6m1dt47j", // new style url
  center: [-76.543134, 43.453054], // starting position [lng, lat]
  zoom: 15.65, // initial zoom start
  bearing: -37.25, // slightly off north to show majority of campus
  pitch: 0, // directly overhead
  // maxBounds: _mapPanBound,
});

function bondFeatures(bound, map, event) {
  // function to get data features underneath point when an event is passed through
  const bbox = [
    // based off of pixel width to determine bounds
    [event.point.x - bound, event.point.y - bound],
    [event.point.x + bound, event.point.y + bound],
  ];

  return map.queryRenderedFeatures(bbox, { layers: ["buildings"] }); // returns Objecct that corresponds with data values under point
  // bounds are passed in so you can tweak the clickable radius of the element corresponding with each building.
}

map.on("click", (event) => {
  const features = bondFeatures(_bounds, map, event); // attempts to get features within a certain radial point, tweak _Bounds to make radius more liberal/conservative
  ensureClose("right"); // ensures right sidebar collapses

  if (features.length !== -1) {
    // will trigger if any features exist under point and open side bar.
    // TODO Consideration:  Make this similar to the left side bar where the html is static on the index.html
    // Populates building data as html
    const popupHtml = `
    <img src="images/building-images/${features[0].properties.buildingNo}.jpg" alt="Image of ${features[0].properties.name}"></img>
    </br>
    <strong>Building No: </strong>${features[0].properties.buildingNo}
    </br>
    <strong>Ft<sup>2</sup>: </strong>${features[0].properties.squareFt}
    </br>
    <a href="https://aim.sucf.suny.edu/fmax/screen/MASTER_ASSET_VIEW?assetTag=${features[0].properties.assetID}" target="_blank">AIM Asset View</a>
    `;
    document.getElementById("right-sidebar-body-inserter").innerHTML =
      popupHtml; // inserts into sidebar
    document.getElementById("info-building").innerHTML =
      features[0].properties.name; // sets buildings name in top content area
    toggleSidebar("right"); // toggles sidebar should close and reopen as new building if clicking new building
  }
});

map.on("click", "buildings", (e) => {
  const constraintZoom = map.getZoom() > flyToZoom ? map.getZoom() : flyToZoom; // if zoom is less than fly too zoom constraint, uses current zoom level
  // notes higher zoom level means more magnifation
  map.flyTo({
    center: e.features[0].geometry.coordinates, // centers map based on exact point in geoJson array
    zoom: constraintZoom, // new constrainted zoom, since this is an object data value, variable needs to be declares up top
    speed: 0.3,
  });
});

function flyToId(id) {
  // WIP This will pass the html element id and match to a json map to get specific map fly to constraints.
  map.flyTo({
    center: [-76.543134, 43.453054],
    zoom: constraintZoom,
    speed: 0.3,
  });
  console.log(id);
}

map.on("mouseenter", "buildings", () => {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "buildings", () => {
  map.getCanvas().style.cursor = "";
});

map.on("mousemove", (event) => {
  // tracks live map data based on position of map, zoom, bearing, pitch etc. Mostly used for testing
  const features = bondFeatures(_bounds, map, event);

  document.getElementById("building").innerHTML = features.length
    ? JSON.stringify(features[0].properties.name)
    : "N/a";
  document.getElementById("coords").innerHTML = JSON.stringify(event.point);
  document.getElementById("mlat").innerHTML = JSON.stringify(event.lngLat.lng);
  document.getElementById("mlng").innerHTML = JSON.stringify(event.lngLat.lat);
  document.getElementById("clat").innerHTML = map.getCenter().lat;
  document.getElementById("clng").innerHTML = map.getCenter().lng;
  document.getElementById("currentZoom").innerHTML = map.getZoom();
  document.getElementById("bearing").innerHTML = map.getBearing();
  document.getElementById("pitch").innerHTML = map.getPitch();
});

function toggleSidebar(id) { 
  let elem = document.getElementById(id);
  let classes = elem.className.split(" ");
  let padding = {};

  if (elem.classList.contains("collapsed")) {
    // Remove the 'collapsed' class from the class list of the element, this sets it back to the expanded state.
    classes.splice(classes.indexOf("collapsed"), 1);
  } else {
    padding[id] = 0;
    // Add the 'collapsed' class to the class list of the element
    classes.push("collapsed");
  }

  // Update the class list on the element
  elem.className = classes.join(" ");
}

function ensureClose(id) {
  let elem = document.getElementById(id);
  if (!elem.classList.contains("collapsed")) {
    let classes = elem.className.split(" ");
    let padding = {};
    padding[id] = 0;
    classes.push("collapsed");
    elem.className = classes.join(" ");
  }
}
