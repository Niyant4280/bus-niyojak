const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5001/api';

async function addGTFSDataViaAPI() {
  try {
    console.log('🚀 Starting GTFS data import via API...');
    
    // Test API connection
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ API connection successful');

    // Import routes
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

    // Add routes in batches
    const batchSize = 10;
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      try {
        await axios.post(`${API_BASE}/gtfs/routes/batch`, { routes: batch });
        console.log(`✅ Added routes batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(routes.length/batchSize)}`);
      } catch (error) {
        console.log(`⚠️  Batch ${Math.floor(i/batchSize) + 1} failed, continuing...`);
      }
    }

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

    // Add stops in batches
    for (let i = 0; i < stops.length; i += batchSize) {
      const batch = stops.slice(i, i + batchSize);
      try {
        await axios.post(`${API_BASE}/gtfs/stops/batch`, { stops: batch });
        console.log(`✅ Added stops batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stops.length/batchSize)}`);
      } catch (error) {
        console.log(`⚠️  Stops batch ${Math.floor(i/batchSize) + 1} failed, continuing...`);
      }
    }

    console.log('🎉 GTFS data import completed!');
    console.log(`📊 Summary: ${routes.length} routes, ${stops.length} stops`);

  } catch (error) {
    console.error('❌ Error importing GTFS data:', error.message);
  }
}

addGTFSDataViaAPI();
