import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import BusSearchForm from "@/components/BusSearchForm";
import TimeDisplay from "@/components/TimeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  MapPin,
  Clock,
  Users,
  Star,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Search,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

export default function Index() {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSearch = async (type: "number" | "route", data: any) => {
    if (type === "number") {
      // Handle route number search (if needed)
      setSearchResults({
        type: "bus",
        busNumber: data.busNumber,
        route: "Central Station → Airport",
        stops: [
          "Central Station",
          "City Mall",
          "University",
          "Hospital",
          "Airport Terminal",
        ],
        nextDeparture: "15 mins",
        frequency: "Every 20 mins",
      });
    } else {
      // Handle route search with real GTFS data
      try {
        console.log("Searching for routes between:", data.from, "and", data.to);
        
        // Search for routes between stops using GTFS data
        const response = await fetch(`/api/gtfs/search?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          // Convert GTFS routes to display format with journey type
          const buses = result.data.map((route: any, index: number) => {
            let journeyType = "Average";
            let journeyIcon = "🚌";
            
            if (index === 0) {
              journeyType = "Shortest";
              journeyIcon = "⚡";
            } else if (index >= result.data.length - 2) {
              journeyType = "Alternative";
              journeyIcon = "🔄";
            }
            
            return {
              number: route.route_short_name?.trim() || route.route_id,
              route: route.route_long_name || `${route.route_short_name} Route`,
              nextDeparture: `${Math.floor(Math.random() * 8) + 2}-${Math.floor(Math.random() * 8) + 8} minutes`,
              frequency: route.route_type === 1 ? "Every 10-15 mins" : "Every 15-20 mins",
              capacity: route.route_type === 1 ? 50 : 30,
              rating: 4.2,
              isActive: route.isActive,
              agencyId: route.agency_id,
              routeType: route.route_type,
              journeyType: journeyType,
              journeyIcon: journeyIcon,
              relevanceScore: route.relevanceScore
            };
          });
          
          setSearchResults({
            type: "route",
            buses: buses,
            from: data.from,
            to: data.to
          });
        } else {
          // No routes found, show message
          setSearchResults({
            type: "route",
            buses: [],
            from: data.from,
            to: data.to,
            noResults: true
          });
        }
      } catch (error) {
        console.error("Error searching routes:", error);
        setSearchResults({
          type: "route",
          buses: [],
          from: data.from,
          to: data.to,
          error: "Failed to search routes. Please try again."
        });
      }
    }
  };

  const scrollToResults = () => {
    if (searchResults) {
      const resultsElement = document.getElementById('search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  };

  // Bus animation functions
  const nextStop = () => {
    if (searchResults?.type === "route" && searchResults.buses?.length > 0) {
      const currentBus = searchResults.buses[0]; // Use first bus for demo
      const stops = currentBus.stops || [
        "Central Station",
        "City Mall", 
        "University",
        "Hospital",
        "Airport Terminal"
      ];
      
      setCurrentStopIndex((prev) => (prev + 1) % stops.length);
    }
  };

  const resetAnimation = () => {
    setCurrentStopIndex(0);
    setIsAnimating(false);
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        nextStop();
      }, 2000); // Move to next stop every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnimating, currentStopIndex]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 pb-7">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6">
              Welcome to <span className="text-black">Bus</span>
              <span className="text-red-500">नियोजक</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Plan your journey, discover the best routes, and experience
              seamless bus travel—all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-4">
              <Badge className="text-xs sm:text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors px-3 sm:px-4 py-1 sm:py-2 font-semibold">
                <Clock className="h-3 w-3 mr-1" />
                Real-time Tracking
              </Badge>
              <Badge className="text-xs sm:text-sm bg-red-500 text-white hover:bg-red-500 transition-colors px-3 sm:px-4 py-1 sm:py-2 font-semibold">
                <MapPin className="h-3 w-3 mr-1" />
                Route Planning
              </Badge>
              <Badge className="text-xs sm:text-sm bg-green-600 text-white hover:bg-green-700 transition-colors px-3 sm:px-4 py-1 sm:py-2 font-semibold">
                <Shield className="h-3 w-3 mr-1" />
                Secure & Reliable
              </Badge>
            </div>
          </div>

          {/* Search Form */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            {searchResults?.type === "bus" && (
              <div className="mb-4 text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <Bus className="h-4 w-4" />
                  <span>Search form auto-populated with Bus {searchResults.busNumber}</span>
                </div>
              </div>
            )}
            <BusSearchForm 
              onSearch={handleSearch} 
              scrollToResults={scrollToResults}
              initialBusNumber={searchResults?.type === "bus" ? searchResults.busNumber : undefined}
              showBusNumberSearch={false}
            />
          </div>

          {/* Search Results */}
          {searchResults && (
            <div id="search-results" className="mb-8 sm:mb-12 lg:mb-16 px-4">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bus className="h-5 w-5 text-primary" />
                    <span>Search Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.type === "bus" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Bus {searchResults.busNumber}
                          </h3>
                          <p className="text-muted-foreground">
                            {searchResults.route}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TimeDisplay 
                          time={searchResults.nextDeparture} 
                          type="departure" 
                          size="large"
                        />
                        <TimeDisplay 
                          time={searchResults.frequency} 
                          type="frequency" 
                          size="large"
                        />
                      </div>
                      <Button asChild className="w-full">
                        <Link to={`/search?bus=${encodeURIComponent(searchResults.busNumber)}&route=${encodeURIComponent(searchResults.route)}`}>
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Map
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.error ? (
                        <div className="text-center py-8">
                          <div className="text-red-500 mb-2">⚠️</div>
                          <p className="text-red-600">{searchResults.error}</p>
                        </div>
                      ) : searchResults.noResults ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-2">🚌</div>
                          <p className="text-gray-600">No bus routes found between "{searchResults.from}" and "{searchResults.to}"</p>
                          <p className="text-sm text-gray-500 mt-2">Try different stops or check the spelling</p>
                        </div>
                      ) : searchResults.buses.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-gray-600">Searching for routes...</p>
                        </div>
                      ) : (
                        <>
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Routes from "{searchResults.from}" to "{searchResults.to}"
                            </h3>
                            <p className="text-sm text-gray-600">
                              Showing {searchResults.buses.length} best route{searchResults.buses.length !== 1 ? 's' : ''} (shortest, average & alternative options)
                            </p>
                          </div>
                          {searchResults.buses.map((bus: any, index: number) => (
                            <Link
                              key={index}
                              to={`/search?bus=${encodeURIComponent(bus.number)}&route=${encodeURIComponent(bus.route)}`}
                              className="block"
                            >
                              <div
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">Route {bus.number}</h3>
                                    <Badge className={`text-xs ${
                                      bus.journeyType === 'Shortest' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : bus.journeyType === 'Alternative'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {bus.journeyIcon} {bus.journeyType}
                                    </Badge>
                                    {bus.isActive && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Live
                                      </Badge>
                                    )}
                                    {bus.routeType === 1 && (
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        Bus
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {bus.route}
                                  </p>
                                  {bus.agencyId && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      {bus.agencyId} • {bus.capacity} capacity
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-3">
                                    <TimeDisplay 
                                      time={bus.nextDeparture} 
                                      type="departure" 
                                      size="small"
                                    />
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <TimeDisplay 
                                      time={bus.frequency} 
                                      type="frequency" 
                                      size="small"
                                    />
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs text-gray-600">{bus.rating}</span>
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                              </div>
                            </Link>
                          ))}

                          {/* Bus Animation Section */}
                          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="text-center mb-4">
                              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                                🚌 Bus Route Animation
                              </h4>
                              <p className="text-sm text-blue-700">
                                Watch the bus travel through the route stops
                              </p>
                            </div>
                            
                            {/* Route Visualization */}
                            <div className="relative mb-6">
                              <div className="flex items-center justify-between">
                                {(() => {
                                  const stops = [
                                    "Central Station",
                                    "City Mall", 
                                    "University",
                                    "Hospital",
                                    "Airport Terminal"
                                  ];
                                  
                                  return stops.map((stop, index) => (
                                    <div key={index} className="flex flex-col items-center relative">
                                      {/* Stop Circle */}
                                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                                        index === currentStopIndex 
                                          ? 'bg-red-500 border-red-500 scale-125' 
                                          : index < currentStopIndex
                                          ? 'bg-green-500 border-green-500'
                                          : 'bg-gray-300 border-gray-300'
                                      }`} />
                                      
                                      {/* Stop Name */}
                                      <div className="mt-2 text-xs text-center max-w-20">
                                        <span className={`font-medium ${
                                          index === currentStopIndex ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                          {stop}
                                        </span>
                                      </div>
                                      
                                      {/* Bus Icon at Current Stop */}
                                      {index === currentStopIndex && (
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                                          <div className="bg-red-500 text-white p-1 rounded-full animate-bounce">
                                            <Bus className="h-4 w-4" />
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Connection Line */}
                                      {index < stops.length - 1 && (
                                        <div className={`absolute top-2 left-6 w-full h-0.5 transition-all duration-500 ${
                                          index < currentStopIndex ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                      )}
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                            
                            {/* Animation Controls */}
                            <div className="flex justify-center space-x-3">
                              <Button
                                onClick={nextStop}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Next Stop
                              </Button>
                              
                              <Button
                                onClick={toggleAnimation}
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                {isAnimating ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-1" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-1" />
                                    Auto Play
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                onClick={resetAnimation}
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reset
                              </Button>
                            </div>
                            
                            {/* Current Status */}
                            <div className="mt-4 text-center">
                              <div className="inline-flex items-center px-3 py-1 bg-white rounded-full border border-blue-200">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-sm text-blue-700">
                                  Bus is at: <strong>{
                                    ["Central Station", "City Mall", "University", "Hospital", "Airport Terminal"][currentStopIndex]
                                  }</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-black">Bus</span>
              <span className="text-red-500">नियोजक</span>?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart tools and real-time insights for a smoother, more connected
              bus experience—for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center transition-shadow transform hover:shadow-2xl hover:-translate-y-1 duration-200">
              <CardHeader>
                <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track buses in real-time with accurate GPS positioning and
                  live updates on arrival times.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow transform hover:shadow-2xl hover:-translate-y-1 duration-200">
              <CardHeader>
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Bus className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Route Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find the best routes between any two stops with multiple bus
                  options and transfer details.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow transform hover:shadow-2xl hover:-translate-y-1 duration-200">
              <CardHeader>
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Empowering users with helpful resources and working together
                  to improve public transport for everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow transform hover:shadow-2xl hover:-translate-y-1 duration-200">
              <CardHeader>
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Smart Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get helpful tips and trends to make your daily commute
                  smoother and more predictable.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow transform hover:shadow-2xl hover:-translate-y-1 duration-200">
              <CardHeader>
                <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Safe & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your data and journeys are protected with the latest security
                  standards and privacy features.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow transform hover:shadow-2xl hover:-translate-y-1 duration-200">
              <CardHeader>
                <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Instant Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stay informed with real-time notifications and quick updates
                  for a hassle-free experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-[rgba(220,38,38,1)] text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-primary-foreground/90">
            Join thousands of users already using&nbsp;
            <span className="font-bold text-white">Bus</span>
            <span className="font-bold text-white">नियोजक</span> for their daily
            transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-red-500 hover:bg-red-50 hover:text-red-500 hover:shadow-lg hover:scale-[1.05] transition-all duration-200 font-semibold border-2 border-red-200 hover:border-red-300"
              asChild
            >
              <Link to="/search">
                <Search className="h-5 w-5 mr-2" />
                <span className="text-red-500">
                  Start Searching
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-foreground">
                  <span className="text-black">Bus</span>
                  <span className="text-red-500">नियोजक</span>
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                Your trusted partner for seamless, smart, and reliable bus
                journeys.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  <Link to="/privacy">Privacy Policy</Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Link to="/terms">Terms of Service</Link>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/search"
                    className="hover:text-foreground transition-colors hover:text-red-500"
                  >
                    Bus Search
                  </Link>
                </li>
                <li>
                  <Link
                    to="/routes"
                    className="hover:text-foreground transition-colors hover:text-red-500"
                  >
                    Route Planning
                  </Link>
                </li>
                <li>
                  <Link
                    to="/advertise-with-us"
                    className="hover:text-foreground transition-colors hover:text-red-500"
                  >
                    Advertisement
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/faq"
                    className="hover:text-foreground transition-colors hover:text-red-500"
                  >
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-foreground transition-colors hover:text-red-500"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>Empowering your journey. Made with care for every commuter.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
