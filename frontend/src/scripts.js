const ORS_API_URL = window.ORS_API_URL || 'http://localhost:8080/ors/v2';

var map = L.map('map').setView([53.5444, -113.4909], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

window.addEventListener('resize', function() {
  map.invalidateSize();
});

var isochronesLayer = L.layerGroup().addTo(map);
var routesLayer = L.layerGroup().addTo(map);
var matrixLayer = L.layerGroup().addTo(map);
var snapLayer = L.layerGroup().addTo(map);

var startMarker, endMarker;

map.on('click', function(e) {
  if (!startMarker) {
    startMarker = L.marker(e.latlng, { draggable: true }).addTo(map);
    startMarker.on('dragend', function(event) {
      var marker = event.target;
      var position = marker.getLatLng();
      updateInputFields('start', position.lat, position.lng);
    });
    updateInputFields('start', e.latlng.lat, e.latlng.lng);
  } else if (!endMarker) {
    endMarker = L.marker(e.latlng, { draggable: true }).addTo(map);
    endMarker.on('dragend', function(event) {
      var marker = event.target;
      var position = marker.getLatLng();
      updateInputFields('end', position.lat, position.lng);
    });
    updateInputFields('end', e.latlng.lat, e.latlng.lng);
  } else {
    map.removeLayer(startMarker);
    map.removeLayer(endMarker);
    startMarker = L.marker(e.latlng, { draggable: true }).addTo(map);
    startMarker.on('dragend', function(event) {
      var marker = event.target;
      var position = marker.getLatLng();
      updateInputFields('start', position.lat, position.lng);
    });
    endMarker = null;
    updateInputFields('start', e.latlng.lat, e.latlng.lng);
  }
});

function updateInputFields(type, lat, lon) {
  if (type === 'start') {
    document.getElementById('route-start-lat').value = lat;
    document.getElementById('route-start-lon').value = lon;
    document.getElementById('matrix-coordinates').value = `${lon},${lat};${document.getElementById('matrix-coordinates').value.split(';')[1]}`;
    document.getElementById('snap-coordinates').value = `${lon},${lat};${document.getElementById('snap-coordinates').value.split(';')[1]}`;
  } else if (type === 'end') {
    document.getElementById('route-end-lat').value = lat;
    document.getElementById('route-end-lon').value = lon;
    document.getElementById('matrix-coordinates').value = `${document.getElementById('matrix-coordinates').value.split(';')[0]};${lon},${lat}`;
    document.getElementById('snap-coordinates').value = `${document.getElementById('snap-coordinates').value.split(';')[0]};${lon},${lat}`;
  }
}

function showLoading() {
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function handleError(error, feedbackElement, defaultMessage) {
  feedbackElement.textContent = defaultMessage || 'Error occurred';
  console.error('Error:', error);
  hideLoading();
}

function fetchIsochrones() {
  const feedback = document.getElementById('iso-feedback');
  const responseDisplay = document.getElementById('response-display');
  feedback.textContent = 'Loading...';
  responseDisplay.textContent = '';
  showLoading();
  isochronesLayer.clearLayers();
  var profile = document.getElementById('iso-profile').value;
  var latitude = parseFloat(document.getElementById('iso-latitude').value);
  var longitude = parseFloat(document.getElementById('iso-longitude').value);
  var range = document.getElementById('iso-range').value.split(',').map(Number);

  if (isNaN(latitude) || isNaN(longitude) || range.some(isNaN)) {
    feedback.textContent = 'Invalid input';
    hideLoading();
    return;
  }

  fetch(`${ORS_API_URL}/isochrones/${profile}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      locations: [[longitude, latitude]],
      range: range
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    responseDisplay.textContent = JSON.stringify(data, null, 2);
    if (data.features && data.features.length > 0) {
      data.features.forEach(feature => {
        var coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        L.polygon(coordinates, {color: 'blue'}).addTo(isochronesLayer);
      });
      map.setView([latitude, longitude], 13);
      feedback.textContent = '';
    } else {
      feedback.textContent = 'No isochrones found';
      console.error('No isochrones found in the response:', data);
    }
    hideLoading();
  })
  .catch(error => handleError(error, feedback, 'Error fetching isochrones'));
}

function clearIsochrones() {
  document.getElementById('iso-feedback').textContent = '';
  document.getElementById('response-display').textContent = '';
  isochronesLayer.clearLayers();
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }
}

function fetchRoute() {
  const feedback = document.getElementById('route-feedback');
  const responseDisplay = document.getElementById('response-display');
  feedback.textContent = 'Loading...';
  responseDisplay.textContent = '';
  showLoading();
  routesLayer.clearLayers();
  var profile = document.getElementById('route-profile').value;
  var startLat = parseFloat(document.getElementById('route-start-lat').value);
  var startLon = parseFloat(document.getElementById('route-start-lon').value);
  var endLat = parseFloat(document.getElementById('route-end-lat').value);
  var endLon = parseFloat(document.getElementById('route-end-lon').value);

  if (isNaN(startLat) || isNaN(startLon) || isNaN(endLat) || isNaN(endLon)) {
    feedback.textContent = 'Invalid input';
    hideLoading();
    return;
  }

  fetch(`${ORS_API_URL}/directions/${profile}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      coordinates: [[startLon, startLat], [endLon, endLat]]
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    responseDisplay.textContent = JSON.stringify(data, null, 2);
    if (data.routes && data.routes.length > 0) {
      var coordinates = decodePolyline(data.routes[0].geometry);
      coordinates = coordinates.map(coord => [coord[0], coord[1]]);
      var polyline = L.polyline(coordinates, {color: 'red'}).addTo(routesLayer);
      map.fitBounds(polyline.getBounds());
      feedback.textContent = '';
    } else {
      feedback.textContent = 'No routes found';
      console.error('No routes found in the response:', data);
    }
    hideLoading();
  })
  .catch(error => handleError(error, feedback, 'Error fetching route'));
}

function clearRoutes() {
  document.getElementById('route-feedback').textContent = '';
  document.getElementById('response-display').textContent = '';
  routesLayer.clearLayers();
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }
}

function fetchMatrix() {
  const feedback = document.getElementById('matrix-feedback');
  const responseDisplay = document.getElementById('response-display');
  feedback.textContent = 'Loading...';
  responseDisplay.textContent = '';
  showLoading();
  matrixLayer.clearLayers();
  var profile = document.getElementById('matrix-profile').value;
  var coordinatesInput = document.getElementById('matrix-coordinates').value;
  var coordinates = coordinatesInput.split(';').map(coord => coord.split(',').map(Number));
  var metrics = document.getElementById('matrix-metrics').value.split(',');

  console.log("Sending Matrix Request:", {
    locations: coordinates,
    metrics: metrics,
    units: "km"
  });

  if (coordinates.some(pair => pair.some(isNaN))) {
    feedback.textContent = 'Invalid input';
    hideLoading();
    return;
  }

  fetch(`${ORS_API_URL}/matrix/${profile}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      locations: coordinates,
      metrics: metrics,
      units: "km"
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    responseDisplay.textContent = JSON.stringify(data, null, 2);
    console.log("Matrix Response:", data);
    if (data.durations && data.distances) {
      var origins = data.sources.map(source => [source.location[1], source.location[0]]);
      var destinations = data.destinations.map(dest => [dest.location[1], dest.location[0]]);

      origins.forEach(origin => L.circleMarker(origin, {color: 'green'}).addTo(matrixLayer));
      destinations.forEach(dest => L.circleMarker(dest, {color: 'blue'}).addTo(matrixLayer));

      var bounds = calculateLayerBounds(matrixLayer);
      map.fitBounds(bounds);
      feedback.textContent = '';
    } else {
      feedback.textContent = 'No matrix data found';
      console.error('No matrix data found in the response:', data);
    }
    hideLoading();
  })
  .catch(error => handleError(error, feedback, 'Error fetching matrix'));
}

function clearMatrix() {
  document.getElementById('matrix-feedback').textContent = '';
  document.getElementById('response-display').textContent = '';
  matrixLayer.clearLayers();
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }
}

function fetchSnap() {
  const feedback = document.getElementById('snap-feedback');
  const responseDisplay = document.getElementById('response-display');
  feedback.textContent = 'Loading...';
  responseDisplay.textContent = '';
  showLoading();
  snapLayer.clearLayers();
  var profile = document.getElementById('snap-profile').value;
  var coordinatesInput = document.getElementById('snap-coordinates').value;
  var coordinates = coordinatesInput.split(';').map(coord => coord.split(',').map(Number));
  var radius = parseFloat(document.getElementById('snap-radius').value);

  console.log("Sending Snap Request:", {
    locations: coordinates,
    radius: radius
  });

  if (coordinates.some(pair => pair.some(isNaN)) || isNaN(radius)) {
    feedback.textContent = 'Invalid input';
    hideLoading();
    return;
  }

  fetch(`${ORS_API_URL}/snap/${profile}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      locations: coordinates,
      radius: radius
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    responseDisplay.textContent = JSON.stringify(data, null, 2);
    console.log("Snap Response:", data);
    if (data.locations && data.locations.length > 0) {
      data.locations.forEach(location => {
        L.marker([location.location[1], location.location[0]], {title: location.name}).addTo(snapLayer);
      });

      var bounds = calculateLayerBounds(snapLayer);
      map.fitBounds(bounds);
      feedback.textContent = '';
    } else {
      feedback.textContent = 'No snap data found';
      console.error('No snap data found in the response:', data);
    }
    hideLoading();
  })
  .catch(error => handleError(error, feedback, 'Error fetching snap'));
}

function clearSnap() {
  document.getElementById('snap-feedback').textContent = '';
  document.getElementById('response-display').textContent = '';
  snapLayer.clearLayers();
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }
}

function calculateLayerBounds(layerGroup) {
  var bounds = L.latLngBounds();
  layerGroup.eachLayer(function(layer) {
    if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
      bounds.extend(layer.getLatLng());
    } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
      bounds.extend(layer.getBounds());
    }
  });
  return bounds;
}

function decodePolyline(encoded) {
  var points = [];
  var index = 0, len = encoded.length;
  var lat = 0, lng = 0;

  while (index < len) {
    var b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push([lat * 1e-5, lng * 1e-5]);
  }

  return points;
}

// Trigger resize event to ensure the map is rendered properly
window.dispatchEvent(new Event('resize'));