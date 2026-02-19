# Bus Niyojak Backend

A comprehensive backend API for the Bus Niyojak transportation system, built with Node.js, Express, and MongoDB. This backend provides GTFS data management, real-time bus search, route planning, and user management services.

## 🚀 Features

- **GTFS Data Management**: Complete GTFS (General Transit Feed Specification) data import and management
- **Real-time Bus Search**: Advanced search functionality with location-based queries
- **Route Planning**: Comprehensive route information with stops, schedules, and shapes
- **Geospatial Queries**: Location-based stop searches and nearby stop discovery
- **User Management**: Authentication, authorization, and user profile management
- **Booking System**: Bus booking and reservation management
- **Real-time Tracking**: Live bus location and status updates
- **Analytics**: Transportation data analytics and reporting

## 🏗️ Architecture

```
backend/
├── models/           # MongoDB data models
├── routes/           # API route handlers
├── middleware/       # Express middleware
├── scripts/          # Data import and utility scripts
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
└── .env              # Environment configuration
```

## 📊 Data Models

### GTFS Models
- **GTFSRoute**: Bus route information
- **GTFSStop**: Bus stop locations and details
- **GTFSTrip**: Trip schedules and routes
- **GTFSStopTime**: Stop timing information
- **GTFSCalendar**: Service calendar and operating days
- **GTFSShape**: Route shape and geometry

### Business Models
- **User**: User accounts and profiles
- **Booking**: Bus reservations and tickets
- **Bus**: Bus fleet management
- **Route**: Custom route definitions

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy and edit the environment file
   cp .env.example .env
   ```
   
   Update `.env` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   PORT=5001
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Import GTFS data**
   ```bash
   # Run the data import script
   node scripts/import-gtfs.js
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🚀 Quick Start

Use the provided startup script for easy setup:

```bash
./start.sh
```

This script will:
- Check and create environment configuration
- Install dependencies if needed
- Import GTFS data to MongoDB
- Start the server

## 📡 API Endpoints

### GTFS Data
- `GET /api/gtfs/routes` - Get all bus routes
- `GET /api/gtfs/stops` - Get all bus stops
- `GET /api/gtfs/routes/:id/trips` - Get trips for a route
- `GET /api/gtfs/search` - Search routes between stops

### Bus Search
- `POST /api/bus-search/search` - Search buses between locations
- `GET /api/bus-search/routes/:id/details` - Get route details
- `GET /api/bus-search/realtime/:id` - Get real-time bus data

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id` - Update booking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 5001 |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | development |

### MongoDB Connection

The backend connects to MongoDB Atlas using the provided connection string. Ensure your MongoDB cluster:
- Has network access configured
- Has proper user credentials
- Has sufficient storage for GTFS data

## 📊 Data Import

### GTFS Data Structure

The system expects GTFS data in the following CSV files:
- `routes.csv` - Route definitions
- `stops.csv` - Stop locations
- `trips.csv` - Trip schedules
- `stop_times.csv` - Stop timing
- `calendar.csv` - Service calendar
- `shapes.csv` - Route geometry

### Import Process

1. Place CSV files in the `routes/` directory
2. Run the import script: `node scripts/import-gtfs.js`
3. Monitor the import progress
4. Verify data in MongoDB

## 🔍 API Usage Examples

### Search for Buses

```javascript
const response = await fetch('/api/bus-search/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Dilshad Garden',
    to: 'Kashmere Gate',
    date: '2024-01-15',
    time: '09:00',
    passengers: 2
  })
});

const results = await response.json();
```

### Get Route Details

```javascript
const response = await fetch('/api/gtfs/routes/1');
const route = await response.json();
```

### Find Nearby Stops

```javascript
const response = await fetch('/api/gtfs/stops/nearby?lat=28.6448&lng=77.216721&radius=2');
const nearbyStops = await response.json();
```

## 🧪 Testing

### Manual Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- cURL
- Browser developer tools

### Health Check

```bash
curl http://localhost:5001/api/health
```

## 📈 Performance

### Optimization Features

- **Database Indexes**: Optimized MongoDB indexes for common queries
- **Pagination**: Large result sets are paginated
- **Geospatial Indexes**: 2dsphere indexes for location queries
- **Batch Processing**: Efficient bulk data operations

### Monitoring

Monitor API performance using:
- MongoDB query performance
- Response time metrics
- Error rate tracking
- Database connection status

## 🔒 Security

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request data validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Cross-origin resource sharing setup
- **Environment Variables**: Secure configuration management

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access
   - Check user credentials

2. **GTFS Import Errors**
   - Verify CSV file format
   - Check file permissions
   - Monitor import logs

3. **Server Won't Start**
   - Check port availability
   - Verify environment variables
   - Check for syntax errors

### Logs

Monitor server logs for:
- Database connection status
- API request logs
- Error messages
- Import progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the troubleshooting section
- Open an issue on GitHub
- Contact the development team

## 🔄 Updates

### Recent Updates

- Added comprehensive GTFS data management
- Implemented real-time bus search
- Added geospatial query support
- Enhanced API documentation
- Improved error handling

### Planned Features

- Real-time bus tracking
- Advanced analytics dashboard
- Mobile app API endpoints
- Payment integration
- Notification system

---

**Bus Niyojak Backend** - Powering the future of public transportation! 🚌✨ 