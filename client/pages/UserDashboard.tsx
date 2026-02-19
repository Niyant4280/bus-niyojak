import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bus,
  MapPin,
  Clock,
  Star,
  History,
  Settings,
  User,
  Bell,
  Route,
  Calendar,
  TrendingUp,
  Heart,
  Search,
  Plus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface SavedRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  busNumbers: string[];
  duration: string;
  frequency: string;
  isFavorite: boolean;
  lastUsed: Date;
}

interface TravelHistory {
  id: string;
  date: Date;
  busNumber: string;
  route: string;
  from: string;
  to: string;
  duration: string;
  status: "completed" | "cancelled" | "missed";
}

interface Notification {
  id: string;
  type: "route_update" | "delay" | "new_service" | "general";
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
}

export default function UserDashboard() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    memberSince: "January 2024",
    totalTrips: 24,
    favoriteRoutes: 5,
  });

  const [savedRoutes] = useState<SavedRoute[]>([
    {
      id: "1",
      name: "Home to Office",
      from: "Rajouri Garden",
      to: "Connaught Place",
      busNumbers: ["101", "205"],
      duration: "35 mins",
      frequency: "Every 15 mins",
      isFavorite: true,
      lastUsed: new Date(),
    },
    {
      id: "2",
      name: "Weekend Shopping",
      from: "Dwarka",
      to: "Karol Bagh",
      busNumbers: ["AC-42", "718"],
      duration: "45 mins",
      frequency: "Every 20 mins",
      isFavorite: true,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Airport Route",
      from: "Central Delhi",
      to: "IGI Airport",
      busNumbers: ["Airport Express"],
      duration: "60 mins",
      frequency: "Every 30 mins",
      isFavorite: false,
      lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [recentTrips] = useState<TravelHistory[]>([
    {
      id: "1",
      date: new Date(),
      busNumber: "101",
      route: "Rajouri Garden → CP",
      from: "Rajouri Garden",
      to: "Connaught Place",
      duration: "32 mins",
      status: "completed",
    },
    {
      id: "2",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      busNumber: "205",
      route: "CP → Rajouri Garden",
      from: "Connaught Place",
      to: "Rajouri Garden",
      duration: "38 mins",
      status: "completed",
    },
    {
      id: "3",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      busNumber: "AC-42",
      route: "Dwarka → Karol Bagh",
      from: "Dwarka",
      to: "Karol Bagh",
      duration: "42 mins",
      status: "completed",
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "route_update",
      title: "Route Update",
      message: "Bus 101 route has been modified. Check new timings.",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: "2",
      type: "delay",
      title: "Service Delay",
      message: "Bus AC-42 is running 15 minutes late due to traffic.",
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: "3",
      type: "new_service",
      title: "New Service",
      message: "New express service launched between Dwarka and Airport.",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
    },
  ]);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Member since {user.memberSince} • {user.totalTrips} total trips
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saved Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{savedRoutes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">{user.favoriteRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link to="/search">
                    <Bus className="h-4 w-4 mr-2" />
                    Search Buses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/routes">
                    <Route className="h-4 w-4 mr-2" />
                    Plan Route
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/history">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Recent Alerts
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/notifications">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.isRead ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.time.toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Saved Routes */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Saved Routes
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {route.name}
                            </h3>
                            {route.isFavorite && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {route.from} → {route.to}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Bus className="h-4 w-4 mr-1" />
                              {route.busNumbers.join(", ")}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {route.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Search className="h-4 w-4" />
                          </Button>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trips */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Recent Trips
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/history">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">
                              Bus {trip.busNumber}
                            </p>
                            <Badge
                              variant={
                                trip.status === "completed"
                                  ? "default"
                                  : trip.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {trip.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{trip.route}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{trip.date.toLocaleDateString()}</span>
                            <span>{trip.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
