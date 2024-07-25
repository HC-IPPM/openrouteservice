Here is the detailed `README.md` file incorporating the provided information and focusing on the usage, features, and endpoints of OpenRouteService (ORS):

---

# OpenRouteService (ORS) UI and API

This repository contains a custom deployment of OpenRouteService (ORS) and a frontend UI for interacting with the ORS API. The setup allows users to utilize various geographic and routing services provided by ORS. Currently, the service is configured to work for the Alberta province in Canada using an Alberta-specific .osm.pbf file.

## Table of Contents

- [Overview](#overview)
- [Available Endpoints](#available-endpoints)
  - [Directions](#directions)
  - [Isochrones](#isochrones)
  - [Matrix](#matrix)
  - [Snap](#snap)
  - [Status](#status)
- [Usage](#usage)
  - [UI Usage](#ui-usage)
  - [API Usage](#api-usage)
- [Examples](#examples)
  - [Fetching Directions](#fetching-directions)
  - [Generating Isochrones](#generating-isochrones)
  - [Calculating Matrix](#calculating-matrix)
  - [Snapping Coordinates](#snapping-coordinates)
- [About ORS](#about-ors)
- [Contributing](#contributing)
- [License](#license)

## Overview

OpenRouteService (ORS) is a highly customizable, performant routing service written in Java. It uses a forked and edited version of GraphHopper to provide global spatial services by consuming user-generated and collaboratively collected free geographic data directly from OpenStreetMap.

### Features of ORS

- **Directions Service**: Get directions for different modes of transport.
- **Isochrones Service**: Obtain areas of reachability from given locations.
- **Matrix Service**: Obtain one-to-many, many-to-one, and many-to-many matrices for time and distance.
- **Snapping Service**: Snap coordinates to the road network.
- **Export Service**: Export the base graph for different modes of transport (not available in the public API).
- **Health Endpoint**: Get information on the health of the running ORS instance.
- **Status Endpoint**: Get information on the status of the ORS instance.

## Available Endpoints

### Directions

Retrieve directions between specified start and end points.

- **Endpoint**: `/ors/v2/directions/{profile}`
- **HTTP Method**: POST
- **Request Body**:
  ```json
  {
    "coordinates": [
      [longitude1, latitude1],
      [longitude2, latitude2]
    ]
  }
  ```
- **Profiles**: `driving-car`, `cycling-regular`, `foot-walking`, etc.

### Isochrones

Generate isochrones (areas of reachability) from a given location.

- **Endpoint**: `/ors/v2/isochrones/{profile}`
- **HTTP Method**: POST
- **Request Body**:
  ```json
  {
    "locations": [
      [longitude, latitude]
    ],
    "range": [time_in_seconds]
  }
  ```
- **Profiles**: `driving-car`, `cycling-regular`, `foot-walking`, etc.

### Matrix

Calculate a matrix of distances and/or times between multiple points.

- **Endpoint**: `/ors/v2/matrix/{profile}`
- **HTTP Method**: POST
- **Request Body**:
  ```json
  {
    "locations": [
      [longitude1, latitude1],
      [longitude2, latitude2]
    ],
    "metrics": ["distance", "duration"]
  }
  ```
- **Profiles**: `driving-car`, `cycling-regular`, `foot-walking`, etc.

### Snap

Snap coordinates to the nearest road network.

- **Endpoint**: `/ors/v2/snap/{profile}`
- **HTTP Method**: POST
- **Request Body**:
  ```json
  {
    "locations": [
      [longitude, latitude]
    ],
    "radius": radius_in_meters
  }
  ```
- **Profiles**: `driving-car`, `cycling-regular`, `foot-walking`, etc.

### Status

Check the status of the ORS instance.

- **Endpoint**: `/ors/v2/status`
- **HTTP Method**: GET

## Usage

### UI Usage

1. **Access the UI**:
   Navigate to `https://ors-sro.alpha.phac-aspc.gc.ca` in your web browser.

2. **Using the Map**:
   - Click on the map to set start and end points for directions.
   - Use the provided forms to generate isochrones, calculate matrix values, and snap coordinates.

### API Usage

You can interact with the ORS API using tools like `curl`, Postman, or directly within your applications.

#### Fetching Directions

```sh
curl -X POST "https://ors-sro.alpha.phac-aspc.gc.ca/ors/v2/directions/driving-car" -H "Content-Type: application/json" -d '{
  "coordinates": [
    [-114.0719, 51.0447],
    [-113.4938, 53.5461]
  ]
}'
```

#### Generating Isochrones

```sh
curl -X POST "https://ors-sro.alpha.phac-aspc.gc.ca/ors/v2/isochrones/driving-car" -H "Content-Type: application/json" -d '{
  "locations": [
    [-114.0719, 51.0447]
  ],
  "range": [600]
}'
```

#### Calculating Matrix

```sh
curl -X POST "https://ors-sro.alpha.phac-aspc.gc.ca/ors/v2/matrix/driving-car" -H "Content-Type: application/json" -d '{
  "locations": [
    [-114.0719, 51.0447],
    [-113.4938, 53.5461]
  ],
  "metrics": ["distance", "duration"]
}'
```

#### Snapping Coordinates

```sh
curl -X POST "https://ors-sro.alpha.phac-aspc.gc.ca/ors/v2/snap/driving-car" -H "Content-Type: application/json" -d '{
  "locations": [
    [-114.0719, 51.0447]
  ],
  "radius": 100
}'
```

## Examples

### Fetching Directions

1. Set the start and end coordinates on the map.
2. Click the button to fetch directions.
3. The route will be displayed on the map and the JSON response will be shown.

### Generating Isochrones

1. Set the center location and range on the form.
2. Click the button to generate isochrones.
3. The reachable area will be displayed on the map and the JSON response will be shown.

### Calculating Matrix

1. Set the coordinates and metrics on the form.
2. Click the button to calculate the matrix.
3. The distances and times will be displayed and the JSON response will be shown.

### Snapping Coordinates

1. Set the coordinates and radius on the form.
2. Click the button to snap the coordinates.
3. The snapped location will be displayed on the map and the JSON response will be shown.

## About ORS

OpenRouteService (ORS) is a highly customizable, performant routing service written in Java. It uses a forked and edited version of GraphHopper to provide global spatial services by consuming user-generated and collaboratively collected free geographic data directly from OpenStreetMap.

### Key Features

- **Directions Service**: Provides routing information for various transportation modes such as driving, cycling, and walking.
- **Isochrones Service**: Generates isochrones to show reachable areas within a specified time or distance.
- **Matrix Service**: Calculates distance and time matrices between multiple locations.
- **Snapping Service**: Snaps input coordinates to the nearest road network.
- **Export Service**: Exports the base graph for different modes of transport (available in self-hosted instances).
- **Health and Status Endpoints**: Provides health and status information of the running ORS instance.


## Note

The .osm.pbf file used in this setup is specific to Alberta, Canada. Therefore, the routing, isochrones, and other services will only work for the Alberta province.

## Contributing

Contributions are welcome! Please submit issues and pull requests for any improvements or bug fixes. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the GPL-3.0 and LGPL-3.0 licenses. See the [LICENSE](LICENSE) file for more details.

---

Feel free to adjust the content to better fit your specific setup and requirements.