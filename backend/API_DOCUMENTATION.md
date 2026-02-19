# Bus Niyojak Backend API Documentation

## Overview
This API provides comprehensive bus transportation services including GTFS data management, real-time bus search, route planning, and user management.

## Base URL
```
http://localhost:5001/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## GTFS Data Endpoints

### 1. Routes

#### Get All Routes
```
GET /gtfs/routes
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search in route names
- `type` (optional): Route type filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "route_id": "1",
      "route_short_name": "R_RS",
      "route_long_name": "RED_Rithala to Shaheed Sthal (New Bus Adda)",
      "route_type": 1,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 38,
    "pages": 1
  }
}
```

#### Get Route by ID
```
GET /gtfs/routes/:routeId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "route_id": "1",
    "route_short_name": "R_RS",
    "route_long_name": "RED_Rithala to Shaheed Sthal (New Bus Adda)",
    "route_type": 1,
    "isActive": true
  }
}
```

#### Get Route Trips
```
GET /gtfs/routes/:routeId/trips
```

**Query Parameters:**
- `service_id` (optional): Service ID filter
- `direction_id` (optional): Direction filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "trip_id": "0",
      "route_id": "1",
      "service_id": "weekday",
      "direction_id": 0
    }
  ]
}
```

#### Get Route Shape
```
GET /gtfs/routes/:routeId/shape
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shape_id": "shp_1_30",
    "points": [
      {
        "shape_pt_lat": 28.720821,
        "shape_pt_lon": 77.105042,
        "shape_pt_sequence": 1
      }
    ]
  }
}
```

### 2. Stops

#### Get All Stops
```
GET /gtfs/stops
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100)
- `search` (optional): Search in stop names
- `lat` (optional): Latitude for nearby search
- `lng` (optional): Longitude for nearby search
- `radius` (optional): Search radius in km (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "stop_id": "1",
      "stop_name": "Dilshad Garden",
      "stop_lat": 28.675991,
      "stop_lon": 77.321495,
      "location": {
        "type": "Point",
        "coordinates": [77.321495, 28.675991]
      }
    }
  ]
}
```

#### Get Stop by ID
```
GET /gtfs/stops/:stopId
```

#### Get Nearby Stops
```
GET /gtfs/stops/nearby?lat=28.6448&lng=77.216721&radius=2
```

### 3. Trips and Stop Times

#### Get Trip Stops
```
GET /gtfs/trips/:tripId/stops
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "trip_id": "0",
      "stop_id": {
        "stop_id": "1",
        "stop_name": "Dilshad Garden",
        "stop_lat": 28.675991,
        "stop_lon": 77.321495
      },
      "arrival_time": "06:00:00",
      "departure_time": "06:00:00",
      "stop_sequence": 1
    }
  ]
}
```

### 4. Calendar and Service

#### Get Service Calendar
```
GET /gtfs/calendar
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "service_id": "weekday",
      "monday": 1,
      "tuesday": 1,
      "wednesday": 1,
      "thursday": 1,
      "friday": 1,
      "saturday": 0,
      "sunday": 0,
      "start_date": "20190101",
      "end_date": "20251231"
    }
  ]
}
```

### 5. Route Search

#### Search Routes Between Stops
```
GET /gtfs/search?from=Dilshad Garden&to=Kashmere Gate
```

**Query Parameters:**
- `from`: Starting stop name
- `to`: Destination stop name
- `date` (optional): Travel date

**Response:**
```json
{
  "success": true,
  "data": {
    "from": {
      "stop_id": "1",
      "stop_name": "Dilshad Garden"
    },
    "to": {
      "stop_id": "8",
      "stop_name": "Kashmere Gate"
    },
    "routes": [...],
    "trips": [...]
  }
}
```

### 6. Statistics

#### Get System Statistics
```
GET /gtfs/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": 38,
    "stops": 264,
    "trips": 5440,
    "stopTimes": 150000,
    "shapes": 6645
  }
}
```

## Bus Search Endpoints

### 1. Search Buses

#### Search Buses Between Locations
```
POST /bus-search/search
```

**Request Body:**
```json
{
  "from": "Dilshad Garden",
  "to": "Kashmere Gate",
  "date": "2024-01-15",
  "time": "09:00",
  "passengers": 2,
  "wheelchair": false
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tripId": "0",
      "routeId": "0",
      "busNumber": "R_RD",
      "routeName": "RED_Rithala to Dilshad Garden",
      "from": "Dilshad Garden",
      "to": "Kashmere Gate",
      "stops": [...],
      "frequency": "Every 5-10 min",
      "nextDeparture": "09:15:00",
      "duration": "25 min",
      "isActive": true,
      "rating": 4.5,
      "capacity": 50,
      "currentPassengers": 25,
      "wheelchairAccessible": true,
      "bikesAllowed": false,
      "price": 35,
      "estimatedArrival": "09:40:00"
    }
  ],
  "searchInfo": {
    "from": "Dilshad Garden",
    "to": "Kashmere Gate",
    "date": "2024-01-15",
    "time": "09:00",
    "totalResults": 1
  }
}
```

### 2. Route Details

#### Get Route Details
```
GET /bus-search/routes/:routeId/details
```

**Query Parameters:**
- `service_id` (optional): Service ID filter
- `direction_id` (optional): Direction filter

**Response:**
```json
{
  "success": true,
  "data": {
    "route": {...},
    "stops": [...],
    "statistics": {
      "totalTrips": 150,
      "totalStops": 25,
      "estimatedDuration": "45 min",
      "frequency": "Every 8-12 min",
      "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    "trips": [...]
  }
}
```

### 3. Real-time Data

#### Get Real-time Bus Locations
```
GET /bus-search/realtime/:routeId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "routeId": "1",
    "buses": [
      {
        "busId": "BUS001",
        "currentStop": "Central Station",
        "nextStop": "City Mall",
        "estimatedArrival": "5 min",
        "passengers": 25,
        "location": {
          "lat": 28.6448,
          "lng": 77.216721
        },
        "status": "on_time",
        "speed": 25
      }
    ],
    "lastUpdated": "2024-01-15T09:00:00.000Z"
  }
}
```

## Data Import

### Import GTFS Data
To import the CSV data into MongoDB, run:
```bash
cd backend
npm install
node scripts/import-gtfs.js
```

This will:
1. Connect to MongoDB
2. Import all GTFS CSV files
3. Create proper indexes
4. Validate data integrity

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Rate Limiting

- GTFS endpoints: 100 requests per minute
- Search endpoints: 50 requests per minute
- Real-time endpoints: 200 requests per minute

## Data Models

### GTFSRoute
- `route_id`: Unique route identifier
- `route_short_name`: Short route name (e.g., "R_RS")
- `route_long_name`: Full route description
- `route_type`: Route type (1 = Metro/Subway, 3 = Bus)
- `isActive`: Whether route is currently active

### GTFSStop
- `stop_id`: Unique stop identifier
- `stop_name`: Stop name
- `stop_lat`: Latitude coordinate
- `stop_lon`: Longitude coordinate
- `location`: GeoJSON Point for geospatial queries
- `facilities`: Available facilities at stop

### GTFSTrip
- `trip_id`: Unique trip identifier
- `route_id`: Associated route
- `service_id`: Service calendar reference
- `direction_id`: Trip direction (0 or 1)
- `wheelchair_accessible`: Accessibility flag
- `bikes_allowed`: Bicycle allowance flag

### GTFSStopTime
- `trip_id`: Associated trip
- `stop_id`: Associated stop
- `arrival_time`: Scheduled arrival time
- `departure_time`: Scheduled departure time
- `stop_sequence`: Stop order in trip

## Performance Considerations

1. **Indexes**: All models include proper indexes for common queries
2. **Pagination**: Large result sets are paginated
3. **Geospatial**: Stops include 2dsphere indexes for location-based queries
4. **Batch Processing**: Large imports use batch processing to manage memory

## Security

1. **Input Validation**: All inputs are validated and sanitized
2. **SQL Injection**: MongoDB prevents SQL injection attacks
3. **Rate Limiting**: Prevents abuse and ensures fair usage
4. **Authentication**: JWT-based authentication for protected endpoints 