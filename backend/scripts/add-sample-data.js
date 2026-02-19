const mongoose = require('mongoose');
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

async function addSampleData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🔄 Clearing existing data...');
    await GTFSRoute.deleteMany({});
    await GTFSStop.deleteMany({});
    await GTFSTrip.deleteMany({});
    await GTFSStopTime.deleteMany({});
    await GTFSCalendar.deleteMany({});
    await GTFSShape.deleteMany({});

    // Add sample routes
    console.log('🔄 Adding sample routes...');
    const sampleRoutes = [
      {
        route_id: 'R_RD',
        agency_id: 'DMRC',
        route_short_name: 'R_RD',
        route_long_name: 'RED_Rithala to Dilshad Garden',
        route_type: 1,
        route_color: 'FF0000',
        route_text_color: 'FFFFFF'
      },
      {
        route_id: 'Y_HQ',
        agency_id: 'DMRC',
        route_short_name: 'Y_HQ',
        route_long_name: 'YELLOW_Huda City Centre to Qutab Minar',
        route_type: 1,
        route_color: 'FFFF00',
        route_text_color: '000000'
      },
      {
        route_id: 'B_DN',
        agency_id: 'DMRC',
        route_short_name: 'B_DN',
        route_long_name: 'BLUE_Dwarka Sector - 21 to Noida Electronic City',
        route_type: 1,
        route_color: '0000FF',
        route_text_color: 'FFFFFF'
      },
      {
        route_id: 'P_MS',
        agency_id: 'DMRC',
        route_short_name: 'P_MS',
        route_long_name: 'PINK_Majlis Park to Shiv Vihar',
        route_type: 1,
        route_color: 'FF69B4',
        route_text_color: 'FFFFFF'
      }
    ];

    await GTFSRoute.insertMany(sampleRoutes);
    console.log('✅ Sample routes added');

    // Add sample stops
    console.log('🔄 Adding sample stops...');
    const sampleStops = [
      {
        stop_id: 'RITHALA',
        stop_code: 'RITHALA',
        stop_name: 'Rithala',
        stop_desc: 'Rithala Metro Station',
        stop_lat: 28.7175,
        stop_lon: 77.1031,
        zone_id: '1',
        stop_url: '',
        location_type: 0,
        parent_station: '',
        stop_timezone: 'Asia/Kolkata',
        wheelchair_boarding: 0,
        level_id: '',
        platform_code: ''
      },
      {
        stop_id: 'DILSHAD_GARDEN',
        stop_code: 'DILSHAD_GARDEN',
        stop_name: 'Dilshad Garden',
        stop_desc: 'Dilshad Garden Metro Station',
        stop_lat: 28.6751,
        stop_lon: 77.3195,
        zone_id: '1',
        stop_url: '',
        location_type: 0,
        parent_station: '',
        stop_timezone: 'Asia/Kolkata',
        wheelchair_boarding: 0,
        level_id: '',
        platform_code: ''
      },
      {
        stop_id: 'HUDA_CITY_CENTRE',
        stop_code: 'HUDA_CITY_CENTRE',
        stop_name: 'Huda City Centre',
        stop_desc: 'Huda City Centre Metro Station',
        stop_lat: 28.4721,
        stop_lon: 77.0935,
        zone_id: '1',
        stop_url: '',
        location_type: 0,
        parent_station: '',
        stop_timezone: 'Asia/Kolkata',
        wheelchair_boarding: 0,
        level_id: '',
        platform_code: ''
      },
      {
        stop_id: 'QUTAB_MINAR',
        stop_code: 'QUTAB_MINAR',
        stop_name: 'Qutab Minar',
        stop_desc: 'Qutab Minar Metro Station',
        stop_lat: 28.5245,
        stop_lon: 77.1855,
        zone_id: '1',
        stop_url: '',
        location_type: 0,
        parent_station: '',
        stop_timezone: 'Asia/Kolkata',
        wheelchair_boarding: 0,
        level_id: '',
        platform_code: ''
      }
    ];

    await GTFSStop.insertMany(sampleStops);
    console.log('✅ Sample stops added');

    // Add sample calendar
    console.log('🔄 Adding sample calendar...');
    const sampleCalendar = {
      service_id: 'weekday',
      monday: 1,
      tuesday: 1,
      wednesday: 1,
      thursday: 1,
      friday: 1,
      saturday: 0,
      sunday: 0,
      start_date: '20240101',
      end_date: '20241231'
    };

    await GTFSCalendar.create(sampleCalendar);
    console.log('✅ Sample calendar added');

    // Add sample trips
    console.log('🔄 Adding sample trips...');
    const sampleTrips = [
      {
        route_id: 'R_RD',
        service_id: 'weekday',
        trip_id: 'R_RD_001',
        trip_headsign: 'Dilshad Garden',
        trip_short_name: 'R_RD_001',
        direction_id: 0,
        block_id: 'R_RD_BLOCK_1',
        shape_id: 'R_RD_SHAPE',
        wheelchair_accessible: 1,
        bikes_allowed: 0
      },
      {
        route_id: 'Y_HQ',
        service_id: 'weekday',
        trip_id: 'Y_HQ_001',
        trip_headsign: 'Qutab Minar',
        trip_short_name: 'Y_HQ_001',
        direction_id: 0,
        block_id: 'Y_HQ_BLOCK_1',
        shape_id: 'Y_HQ_SHAPE',
        wheelchair_accessible: 1,
        bikes_allowed: 0
      }
    ];

    await GTFSTrip.insertMany(sampleTrips);
    console.log('✅ Sample trips added');

    // Add sample stop times
    console.log('🔄 Adding sample stop times...');
    const sampleStopTimes = [
      {
        trip_id: 'R_RD_001',
        arrival_time: '06:00:00',
        departure_time: '06:00:00',
        stop_id: 'RITHALA',
        stop_sequence: 1,
        stop_headsign: '',
        pickup_type: 0,
        drop_off_type: 0,
        continuous_pickup: 1,
        continuous_drop_off: 1,
        shape_dist_traveled: 0,
        timepoint: 1
      },
      {
        trip_id: 'R_RD_001',
        arrival_time: '06:30:00',
        departure_time: '06:30:00',
        stop_id: 'DILSHAD_GARDEN',
        stop_sequence: 2,
        stop_headsign: '',
        pickup_type: 0,
        drop_off_type: 0,
        continuous_pickup: 1,
        continuous_drop_off: 1,
        shape_dist_traveled: 15.5,
        timepoint: 1
      },
      {
        trip_id: 'Y_HQ_001',
        arrival_time: '06:15:00',
        departure_time: '06:15:00',
        stop_id: 'HUDA_CITY_CENTRE',
        stop_sequence: 1,
        stop_headsign: '',
        pickup_type: 0,
        drop_off_type: 0,
        continuous_pickup: 1,
        continuous_drop_off: 1,
        shape_dist_traveled: 0,
        timepoint: 1
      },
      {
        trip_id: 'Y_HQ_001',
        arrival_time: '06:45:00',
        departure_time: '06:45:00',
        stop_id: 'QUTAB_MINAR',
        stop_sequence: 2,
        stop_headsign: '',
        pickup_type: 0,
        drop_off_type: 0,
        continuous_pickup: 1,
        continuous_drop_off: 1,
        shape_dist_traveled: 12.3,
        timepoint: 1
      }
    ];

    await GTFSStopTime.insertMany(sampleStopTimes);
    console.log('✅ Sample stop times added');

    console.log('🎉 Sample data added successfully!');
    console.log('📊 You can now search for these routes:');
    console.log('   - R_RD (Red Line: Rithala to Dilshad Garden)');
    console.log('   - Y_HQ (Yellow Line: Huda City Centre to Qutab Minar)');
    console.log('   - B_DN (Blue Line: Dwarka to Noida)');
    console.log('   - P_MS (Pink Line: Majlis Park to Shiv Vihar)');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

addSampleData();
