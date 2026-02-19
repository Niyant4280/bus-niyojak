import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bus,
  MapPin,
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Star,
  Navigation as NavigationIcon,
} from "lucide-react";

interface TravelRecord {
  id: string;
  date: Date;
  busNumber: string;
  route: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  status: "completed" | "cancelled" | "missed" | "delayed";
  rating?: number;
  feedback?: string;
}

export default function TravelHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const [travelHistory] = useState<TravelRecord[]>([
    {
      id: "trip-001",
      date: new Date("2024-12-15"),
      busNumber: "101",
      route: "Rajouri Garden - Connaught Place",
      from: "Rajouri Garden Metro Station",
      to: "Connaught Place",
      departureTime: "09:30 AM",
      arrivalTime: "10:05 AM",
      duration: "35 mins",
      fare: 25,
      status: "completed",
      rating: 4,
      feedback: "Good service, on time",
    },
    {
      id: "trip-002",
      date: new Date("2024-12-14"),
      busNumber: "205",
      route: "Connaught Place - Rajouri Garden",
      from: "Connaught Place",
      to: "Rajouri Garden Metro Station",
      departureTime: "06:45 PM",
      arrivalTime: "07:23 PM",
      duration: "38 mins",
      fare: 25,
      status: "completed",
      rating: 5,
    },
    {
      id: "trip-003",
      date: new Date("2024-12-13"),
      busNumber: "AC-42",
      route: "Dwarka - Karol Bagh",
      from: "Dwarka Sector 21 Metro Station",
      to: "Karol Bagh Metro Station",
      departureTime: "11:15 AM",
      arrivalTime: "11:57 AM",
      duration: "42 mins",
      fare: 45,
      status: "completed",
      rating: 3,
      feedback: "Delayed by 10 minutes",
    },
    {
      id: "trip-004",
      date: new Date("2024-12-12"),
      busNumber: "718",
      route: "Karol Bagh - Dwarka",
      from: "Karol Bagh Metro Station",
      to: "Dwarka Sector 21 Metro Station",
      departureTime: "04:30 PM",
      arrivalTime: "05:15 PM",
      duration: "45 mins",
      fare: 45,
      status: "delayed",
    },
    {
      id: "trip-005",
      date: new Date("2024-12-10"),
      busNumber: "Airport Express",
      route: "Central Delhi - IGI Airport",
      from: "New Delhi Railway Station",
      to: "IGI Airport Terminal 3",
      departureTime: "07:00 AM",
      arrivalTime: "08:00 AM",
      duration: "60 mins",
      fare: 75,
      status: "completed",
      rating: 5,
      feedback: "Excellent service for airport travel",
    },
    {
      id: "trip-006",
      date: new Date("2024-12-08"),
      busNumber: "101",
      route: "Rajouri Garden - Connaught Place",
      from: "Rajouri Garden Metro Station",
      to: "Connaught Place",
      departureTime: "08:45 AM",
      arrivalTime: "---",
      duration: "---",
      fare: 25,
      status: "missed",
    },
  ]);

  const filteredHistory = travelHistory.filter((trip) => {
    const matchesSearch = 
      trip.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const now = new Date();
      const tripDate = trip.date;
      
      switch (dateFilter) {
        case "today":
          matchesDate = tripDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = tripDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = tripDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "missed":
        return "bg-orange-100 text-orange-800";
      case "delayed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const totalTrips = travelHistory.length;
  const completedTrips = travelHistory.filter(t => t.status === "completed").length;
  const totalFare = travelHistory
    .filter(t => t.status === "completed")
    .reduce((sum, trip) => sum + trip.fare, 0);
  const averageRating = travelHistory
    .filter(t => t.rating)
    .reduce((sum, trip, _, arr) => sum + (trip.rating || 0) / arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel History</h1>
              <p className="text-gray-600">View and manage your bus travel records</p>
            </div>
          </div>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <NavigationIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalFare}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by route number, route, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time Period</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Travel Records ({filteredHistory.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "You haven't taken any bus trips yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((trip) => (
                  <div
                    key={trip.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Bus className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Bus {trip.busNumber}
                            </h3>
                            <p className="text-sm text-gray-600">{trip.route}</p>
                          </div>
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {trip.date.toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {trip.departureTime}
                            {trip.arrivalTime !== "---" && ` - ${trip.arrivalTime}`}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {trip.duration}
                          </div>
                          <div className="font-medium text-gray-900">
                            ₹{trip.fare}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>From:</strong> {trip.from}</p>
                          <p><strong>To:</strong> {trip.to}</p>
                        </div>
                        
                        {trip.rating && (
                          <div className="mt-3 flex items-center gap-2">
                            {renderStars(trip.rating)}
                            {trip.feedback && (
                              <span className="text-sm text-gray-600">"{trip.feedback}"</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        {trip.status === "completed" && !trip.rating && (
                          <Button variant="outline" size="sm">
                            Rate Trip
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
