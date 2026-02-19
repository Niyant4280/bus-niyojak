const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const GTFSRoute = require('../models/GTFSRoute');
const GTFSStop = require('../models/GTFSStop');
const GTFSTrip = require('../models/GTFSTrip');
const GTFSStopTime = require('../models/GTFSStopTime');
const GTFSCalendar = require('../models/GTFSCalendar');
const GTFSShape = require('../models/GTFSShape');

async function importGTFSDirect() {
  try {
    console.log('🚀 Starting GTFS data import...');
    
    // Connect to MongoDB with longer timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
    });
    console.log('✅ Connected to MongoDB');

    // Import routes first (smallest dataset)
    console.log('🔄 Importing routes...');
    const routes = [];
    const routesPath = path.join(__dirname, '../../routes/routes.csv');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(routesPath)
        .pipe(csv())
        .on('data', (row) => {
          routes.push({
            route_id: row.route_id,
            agency_id: row.agency_id || 'DMRC',
            route_short_name: row.route_short_name,
            route_long_name: row.route_long_name,
            route_desc: row.route_desc || '',
            route_type: parseInt(row.route_type) || 1,
            route_url: row.route_url || '',
            route_color: row.route_color || '000000',
            route_text_color: row.route_text_color || 'FFFFFF',
            route_sort_order: parseInt(row.route_sort_order) || 0,
            continuous_pickup: parseInt(row.continuous_pickup) || 1,
            continuous_drop_off: parseInt(row.continuous_drop_off) || 1
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clear and insert routes
    await GTFSRoute.deleteMany({});
    await GTFSRoute.insertMany(routes);
    console.log(`✅ Imported ${routes.length} routes`);

    // Import stops
    console.log('🔄 Importing stops...');
    const stops = [];
    const stopsPath = path.join(__dirname, '../../routes/stops.csv');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(stopsPath)
        .pipe(csv())
        .on('data', (row) => {
          stops.push({
            stop_id: row.stop_id,
            stop_code: row.stop_code || '',
            stop_name: row.stop_name,
            stop_desc: row.stop_desc || '',
            stop_lat: parseFloat(row.stop_lat) || 0,
            stop_lon: parseFloat(row.stop_lon) || 0,
            zone_id: row.zone_id || '',
            stop_url: row.stop_url || '',
            location_type: parseInt(row.location_type) || 0,
            parent_station: row.parent_station || '',
            stop_timezone: row.stop_timezone || 'Asia/Kolkata',
            wheelchair_boarding: parseInt(row.wheelchair_boarding) || 0,
            level_id: row.level_id || '',
            platform_code: row.platform_code || ''
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clear and insert stops
    await GTFSStop.deleteMany({});
    await GTFSStop.insertMany(stops);
    console.log(`✅ Imported ${stops.length} stops`);

    // Import calendar
    console.log('🔄 Importing calendar...');
    const calendars = [];
    const calendarPath = path.join(__dirname, '../../routes/calendar.csv');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(calendarPath)
        .pipe(csv())
        .on('data', (row) => {
          calendars.push({
            service_id: row.service_id,
            monday: parseInt(row.monday) || 0,
            tuesday: parseInt(row.tuesday) || 0,
            wednesday: parseInt(row.wednesday) || 0,
            thursday: parseInt(row.thursday) || 0,
            friday: parseInt(row.friday) || 0,
            saturday: parseInt(row.saturday) || 0,
            sunday: parseInt(row.sunday) || 0,
            start_date: row.start_date,
            end_date: row.end_date
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clear and insert calendar
    await GTFSCalendar.deleteMany({});
    await GTFSCalendar.insertMany(calendars);
    console.log(`✅ Imported ${calendars.length} calendar entries`);

    // Import trips (limit to first 500 to avoid timeout)
    console.log('🔄 Importing trips (first 500)...');
    const trips = [];
    const tripsPath = path.join(__dirname, '../../routes/trips.csv');
    let count = 0;
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(tripsPath)
        .pipe(csv())
        .on('data', (row) => {
          if (count < 500) {
            trips.push({
              route_id: row.route_id,
              service_id: row.service_id,
              trip_id: row.trip_id,
              trip_headsign: row.trip_headsign || '',
              trip_short_name: row.trip_short_name || '',
              direction_id: parseInt(row.direction_id) || 0,
              block_id: row.block_id || '',
              shape_id: row.shape_id || '',
              wheelchair_accessible: parseInt(row.wheelchair_accessible) || 0,
              bikes_allowed: parseInt(row.bikes_allowed) || 0
            });
            count++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clear and insert trips
    await GTFSTrip.deleteMany({});
    await GTFSTrip.insertMany(trips);
    console.log(`✅ Imported ${trips.length} trips`);

    // Import stop times (limit to first 1000 to avoid timeout)
    console.log('🔄 Importing stop times (first 1000)...');
    const stopTimes = [];
    const stopTimesPath = path.join(__dirname, '../../routes/stop_times.csv');
    let stopTimeCount = 0;
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(stopTimesPath)
        .pipe(csv())
        .on('data', (row) => {
          if (stopTimeCount < 1000) {
            stopTimes.push({
              trip_id: row.trip_id,
              arrival_time: row.arrival_time,
              departure_time: row.departure_time,
              stop_id: row.stop_id,
              stop_sequence: parseInt(row.stop_sequence) || 0,
              stop_headsign: row.stop_headsign || '',
              pickup_type: parseInt(row.pickup_type) || 0,
              drop_off_type: parseInt(row.drop_off_type) || 0,
              continuous_pickup: parseInt(row.continuous_pickup) || 1,
              continuous_drop_off: parseInt(row.continuous_drop_off) || 1,
              shape_dist_traveled: parseFloat(row.shape_dist_traveled) || 0,
              timepoint: parseInt(row.timepoint) || 1
            });
            stopTimeCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clear and insert stop times
    await GTFSStopTime.deleteMany({});
    await GTFSStopTime.insertMany(stopTimes);
    console.log(`✅ Imported ${stopTimes.length} stop times`);

    console.log('🎉 GTFS data import completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Stops: ${stops.length}`);
    console.log(`   - Calendar: ${calendars.length}`);
    console.log(`   - Trips: ${trips.length}`);
    console.log(`   - Stop Times: ${stopTimes.length}`);

    // Test the data
    console.log('🔍 Testing imported data...');
    const routeCount = await GTFSRoute.countDocuments();
    const stopCount = await GTFSStop.countDocuments();
    console.log(`✅ Database now contains ${routeCount} routes and ${stopCount} stops`);

  } catch (error) {
    console.error('❌ Error importing GTFS data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

importGTFSDirect();
