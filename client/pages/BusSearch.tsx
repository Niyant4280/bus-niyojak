import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  MapPin,
  Clock,
  Users,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface BusRoute {
  busNumber: string;
  routeName: string;
  stops: Stop[];
  frequency: string;
  nextDeparture: string;
  isActive: boolean;
  rating: number;
  capacity: number;
  currentPassengers: number;
  // Additional GTFS fields
  routeType?: number;
  routeColor?: string;
  routeTextColor?: string;
  agencyId?: string;
  routeDesc?: string;
}

export default function BusSearch() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<BusRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [formBusNumber, setFormBusNumber] = useState("");
  const [formFromStop, setFormFromStop] = useState("");
  const [formToStop, setFormToStop] = useState("");
  const [currentBusLocation, setCurrentBusLocation] = useState(0); // Current stop index (0-based)
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"number" | "stops">("number");

  // Debug: Log search params on every render
  console.log("BusSearch component rendered with params:", {
    bus: searchParams.get("bus"),
    route: searchParams.get("route"),
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Mock data for demonstration
  const mockRoutes: BusRoute[] = [
    {
      busNumber: "101",
      routeName: "Central Station → Airport Terminal",
      frequency: "Every 15 minutes",
      nextDeparture: "5 minutes",
      isActive: true,
      rating: 4.5,
      capacity: 50,
      currentPassengers: 32,
      stops: [
        {
          id: "1",
          name: "Central Station",
          lat: 28.6448,
          lng: 77.216721,
        },
        {
          id: "2",
          name: "City Mall",
          lat: 28.6304,
          lng: 77.2177,
        },
        {
          id: "3",
          name: "University Campus",
          lat: 28.6236,
          lng: 77.2085,
        },
        {
          id: "4",
          name: "Metro Junction",
          lat: 28.6129,
          lng: 77.2295,
        },
        {
          id: "5",
          name: "Airport Terminal",
          lat: 28.5562,
          lng: 77.1,
        },
      ],
    },
    {
      busNumber: "205",
      routeName: "Mall Circle → Airport via Highway",
      frequency: "Every 20 minutes",
      nextDeparture: "12 minutes",
      isActive: true,
      rating: 4.2,
      capacity: 45,
      currentPassengers: 28,
      stops: [
        {
          id: "6",
          name: "Mall Circle",
          lat: 28.6304,
          lng: 77.2177,
        },
        {
          id: "7",
          name: "Tech Park",
          lat: 28.6189,
          lng: 77.209,
        },
        {
          id: "8",
          name: "Highway Junction",
          lat: 28.592,
          lng: 77.15,
        },
        {
          id: "9",
          name: "Airport Terminal",
          lat: 28.5562,
          lng: 77.1,
        },
      ],
    },
  ];

  // Travel time estimates between stops (in minutes)
  const getTravelTime = (fromIndex: number, toIndex: number) => {
    try {
      const timeEstimates = {
        "101": [8, 12, 15, 20], // Times between stops for bus 101
        "205": [10, 18, 25],    // Times between stops for bus 205
      };
      
      const busNumber = selectedRoute?.busNumber || "101";
      const times = timeEstimates[busNumber as keyof typeof timeEstimates] || [8, 12, 15, 20];
      
      if (fromIndex < times.length) {
        return times[fromIndex];
      }
      return 10; // Default time
    } catch (err) {
      console.error("Error calculating travel time:", err);
      return 10;
    }
  };



  const handleSearch = useCallback(async (type: "number", data: any) => {
    try {
      console.log("handleSearch called with:", { type, data });
      setError(null);
      setLoading(true);
      setSearchResults([]);
      setSelectedRoute(null);

      // Search real GTFS data
      const response = await fetch(`/api/gtfs/routes?search=${encodeURIComponent(data.busNumber)}&limit=10`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Convert GTFS routes to BusRoute format with proper field mapping
        const gtfsRoutes: BusRoute[] = await Promise.all(result.data.map(async (route: any) => {
          // Get stops for this route
          let routeStops: Stop[] = [];
          try {
            const stopsResponse = await fetch(`/api/gtfs/stops?limit=20`);
            const stopsResult = await stopsResponse.json();
            if (stopsResult.success) {
              routeStops = stopsResult.data.slice(0, 5).map((stop: any) => ({
                id: stop.stop_id,
                name: stop.stop_name,
                lat: stop.stop_lat,
                lng: stop.stop_lon
              }));
            }
          } catch (stopError) {
            console.log("Could not fetch stops for route");
          }

          // Determine route type and frequency based on route_type
          const getFrequency = (routeType: number) => {
            switch (routeType) {
              case 1: return "Every 10-15 minutes"; // Bus
              case 2: return "Every 15-20 minutes"; // Bus
              case 3: return "Every 20-30 minutes"; // Other
              default: return "Every 15-20 minutes";
            }
          };

          const getCapacity = (routeType: number) => {
            switch (routeType) {
              case 1: return 50; // Bus
              case 2: return 30; // Bus
              case 3: return 25; // Other
              default: return 50;
            }
          };

          const getRating = (routeShortName: string) => {
            // Higher rating for main bus routes
            if (routeShortName.includes('R_') || routeShortName.includes('Y_') || 
                routeShortName.includes('B_') || routeShortName.includes('P_')) {
              return 4.5;
            }
            return 4.0;
          };

          return {
            busNumber: route.route_short_name?.trim() || route.route_id,
            routeName: route.route_long_name || `${route.route_short_name} Route`,
            frequency: getFrequency(route.route_type),
            nextDeparture: `${Math.floor(Math.random() * 8) + 2}-${Math.floor(Math.random() * 8) + 8} minutes`,
            isActive: route.isActive !== false,
            rating: getRating(route.route_short_name),
            capacity: getCapacity(route.route_type),
            currentPassengers: Math.floor(Math.random() * (getCapacity(route.route_type) * 0.8)) + 10,
            stops: routeStops,
            // Additional GTFS fields
            routeType: route.route_type,
            routeColor: route.route_color,
            routeTextColor: route.route_text_color,
            agencyId: route.agency_id,
            routeDesc: route.route_desc
          };
        }));
        
        console.log("GTFS data found:", gtfsRoutes);
        setSearchResults(gtfsRoutes);
        if (gtfsRoutes.length > 0) {
          setSelectedRoute(gtfsRoutes[0]);
        }
      } else {
        // Fallback to mock data if no GTFS results
        const matchingRoutes = mockRoutes.filter((route) =>
          route.busNumber.toLowerCase().includes(data.busNumber.toLowerCase()),
        );
        
        console.log("Using mock data:", matchingRoutes);
        setSearchResults(matchingRoutes);
        if (matchingRoutes.length > 0) {
          setSelectedRoute(matchingRoutes[0]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStopSearch = useCallback(async (fromStop: string, toStop: string) => {
    try {
      console.log("Stop search initiated:", { fromStop, toStop });
      setError(null);
      setLoading(true);
      setSearchResults([]);
      setSelectedRoute(null);

      // Search for routes between stops
      const response = await fetch(`/api/gtfs/search?from=${encodeURIComponent(fromStop)}&to=${encodeURIComponent(toStop)}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Convert GTFS routes to BusRoute format
        const gtfsRoutes: BusRoute[] = result.data.map((route: any) => ({
          busNumber: route.route_short_name?.trim() || route.route_id,
          routeName: route.route_long_name || `${route.route_short_name} Route`,
          frequency: route.route_type === 1 ? "Every 10-15 minutes" : "Every 15-20 minutes",
          nextDeparture: `${Math.floor(Math.random() * 8) + 2}-${Math.floor(Math.random() * 8) + 8} minutes`,
          isActive: route.isActive !== false,
          rating: 4.2,
          capacity: route.route_type === 1 ? 50 : 30,
          currentPassengers: Math.floor(Math.random() * 40) + 10,
          stops: [],
          routeType: route.route_type,
          routeColor: route.route_color,
          routeTextColor: route.route_text_color,
          agencyId: route.agency_id,
          routeDesc: route.route_desc
        }));
        
        console.log("GTFS stop search found:", gtfsRoutes);
        setSearchResults(gtfsRoutes);
        if (gtfsRoutes.length > 0) {
          setSelectedRoute(gtfsRoutes[0]);
        }
      } else {
        setError("No routes found between these stops. Please try different stops.");
      }
    } catch (error) {
      console.error("Stop search error:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const scrollToResults = useCallback(() => {
    try {
      const resultsElement = document.getElementById('search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    } catch (error) {
      console.log("Scroll error:", error);
    }
  }, []);

  // Auto-populate form when URL parameters are present
  useEffect(() => {
    const busNumber = searchParams.get("bus");
    const route = searchParams.get("route");
    
    console.log("URL parameters:", { busNumber, route });
    
    if (busNumber) {
      console.log("Processing bus number:", busNumber);
      setFormBusNumber(busNumber);
      setSearchType("number");
      handleSearch("number", { busNumber });
    } else if (route) {
      console.log("Processing route:", route);
      // If route parameter is present, search for buses on that specific route
      // The route parameter contains the full route name, so we'll extract key terms
      setFormFromStop(""); // Clear form fields since we're searching by route name
      setFormToStop("");
      setSearchType("number");
      
      // Extract key terms from the route name for better search
      // e.g., "Red Line - Rithala to Shaheed Sthal" -> "Red Line"
      const routeKeyTerms = route.split(' - ')[0] || route.split(' ')[0] || route;
      console.log("Searching with key terms:", routeKeyTerms);
      
      // Search for the specific route by name
      console.log("About to call handleSearch with:", { busNumber: routeKeyTerms });
      handleSearch("number", { busNumber: routeKeyTerms });
    }
  }, [searchParams]);

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOccupancyLabel = (percentage: number) => {
    if (percentage < 50) return "Available";
    if (percentage < 80) return "Moderate";
    return "Crowded";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bus Route Search
          </h1>
          <p className="text-muted-foreground">
            Search for routes by number or find connections between stops
          </p>
          

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and Results Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bus className="h-5 w-5 text-primary" />
                  <span>Search Routes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      if (formBusNumber.trim()) {
                        console.log("Form submitted with:", formBusNumber.trim());
                        handleSearch("number", { busNumber: formBusNumber.trim() });
                      } else {
                        console.log("Form submitted with empty route number");
                      }
                    } catch (error) {
                      console.error("Form submission error:", error);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="bus-number" className="text-sm font-medium">
                      Enter Route Number
                    </label>
                    <input
                      id="bus-number"
                      name="busNumber"
                      type="text"
                      value={formBusNumber}
                      onChange={(e) => setFormBusNumber(e.target.value)}
                      placeholder="e.g., R_RD, Y_HQ, B_DN, P_MS"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                    {(searchParams.get("bus") || searchParams.get("route")) && (
                      <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                        <Bus className="h-3 w-3" />
                        <span>Auto-populated from search results</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[rgba(220,38,38,1)] hover:bg-[rgba(220,38,38,0.9)]"
                  >
                    <Bus className="h-4 w-4 mr-2" />
                    Find This Route
                  </Button>
                  
                  {/* Test button for debugging */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log("Test search clicked");
                      handleSearch("number", { busNumber: "101" });
                    }}
                    className="w-full"
                  >
                    🧪 Test Search (Bus 101)
                  </Button>
                  

                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                      <Bus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        How Bus Search Works
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Enter the exact route number you want to find</li>
                        <li>• View the complete route and all stops</li>
                        <li>• See real-time location and next departure</li>
                        <li>• Check current passenger capacity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Searching...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && searchResults.length > 0 && (
              <div className="space-y-4" id="search-results">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Search Results</h2>
                  <Badge variant="secondary" className="text-sm">
                    {searchResults.length}{" "}
                    {searchResults.length === 1 ? "result" : "results"} found
                  </Badge>
                </div>
                {searchResults.map((route, index) => {
                  const occupancyPercentage = Math.round(
                    (route.currentPassengers / route.capacity) * 100,
                  );

                  return (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                        selectedRoute?.busNumber === route.busNumber
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:ring-1 hover:ring-primary/30"
                      }`}
                      onClick={() => {
                        setSelectedRoute(route);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Bus className="h-5 w-5 text-primary" />
                              <span>Route {route.busNumber}</span>
                              {route.isActive && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Live
                                </Badge>
                              )}
                              {route.routeType === 1 && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Bus
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {route.routeName}
                            </p>
                            {route.agencyId && (
                              <p className="text-xs text-muted-foreground">
                                {route.agencyId} • Type: {route.routeType === 1 ? 'Bus' : route.routeType === 2 ? 'Bus' : 'Other'}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {route.rating}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                              <Clock className="h-4 w-4 text-red-600" />
                              <span className="text-xs font-medium text-red-600">Next in</span>
                            </div>
                            <p className="font-bold text-lg text-red-600">
                              {route.nextDeparture}
                            </p>
                            <p className="text-xs text-red-500 font-medium">Estimated Time</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-600">Every</span>
                            </div>
                            <p className="font-bold text-sm text-blue-600">
                              {route.frequency}
                            </p>
                            <p className="text-xs text-blue-500 font-medium">Frequency</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Occupancy
                            </span>
                            <span className="font-medium">
                              {route.currentPassengers}/{route.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getOccupancyColor(
                                occupancyPercentage,
                              )}`}
                              style={{ width: `${occupancyPercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{getOccupancyLabel(occupancyPercentage)}</span>
                            <span>{occupancyPercentage}%</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Route Stops</span>
                            <span className="font-medium">{route.stops.length} stops</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {route.stops.slice(0, 3).map((stop, index) => (
                              <div key={stop.id} className="flex items-center space-x-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${
                                  index === 0 ? "bg-green-500" : 
                                  index === route.stops.length - 1 ? "bg-red-500" : "bg-primary"
                                }`}></div>
                                <span className="text-muted-foreground">{stop.name}</span>
                              </div>
                            ))}
                            {route.stops.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{route.stops.length - 3} more stops
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {searchResults.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Selected: {selectedRoute?.busNumber || "None"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Clear form and reset search
                            setSearchResults([]);
                            setSelectedRoute(null);
                          }}
                        >
                          Clear Search
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!loading && searchResults.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Bus Not Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The route number you entered was not found. Please check the
                    number and try again.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Clear form and reset search
                        setSearchResults([]);
                        setSelectedRoute(null);
                      }}
                    >
                      Clear Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2" id="route-map-section">
            <Card className="h-[400px] md:h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>
                    {selectedRoute
                      ? `Bus ${selectedRoute.busNumber} - Live Route Map`
                      : "Search for a bus to view its route"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                {error && (
                  <div className="h-full flex items-center justify-center bg-red-50">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Route</h3>
                      <p className="text-red-600">{error}</p>
                    </div>
                  </div>
                )}
                {selectedRoute && !error ? (
                  <div className="h-full p-6 overflow-y-auto">
                    {/* Route Header */}
                    <div className="text-center mb-6">
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h3 className="text-xl font-bold text-red-600 mb-2">
                          Route {selectedRoute.busNumber}
                        </h3>
                        <p className="text-red-700 font-medium">
                          {selectedRoute.routeName}
                        </p>
                        {selectedRoute.agencyId && (
                          <p className="text-sm text-red-600 mt-1">
                            {selectedRoute.agencyId} • {selectedRoute.routeType === 1 ? 'Bus Route' : selectedRoute.routeType === 2 ? 'Bus Route' : 'Transport Service'}
                          </p>
                        )}
                        <div className="flex items-center justify-center space-x-4 mt-3 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Next: {selectedRoute.nextDeparture}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-600">{selectedRoute.frequency}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route Visualization */}
                    <div className="space-y-4">
                      {/* Live Bus Tracker */}
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-pulse">
                            <Bus className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="text-center">
                            <h5 className="font-semibold text-red-700">Live Bus Tracker</h5>
                            <p className="text-sm text-red-600">
                              Bus is at: <span className="font-bold">{selectedRoute.stops[currentBusLocation]?.name}</span>
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              Stop {currentBusLocation + 1} of {selectedRoute.stops.length}
                            </p>
                          </div>
                        </div>
                        
                        {/* Bus Navigation Controls */}
                        <div className="mt-4 flex items-center justify-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentBusLocation(Math.max(0, currentBusLocation - 1))}
                            disabled={currentBusLocation === 0}
                            className="flex items-center space-x-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Previous</span>
                          </Button>
                          <div className="text-sm font-medium text-red-600">
                            {currentBusLocation + 1} / {selectedRoute.stops.length}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentBusLocation(Math.min(selectedRoute.stops.length - 1, currentBusLocation + 1))}
                            disabled={currentBusLocation === selectedRoute.stops.length - 1}
                            className="flex items-center space-x-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Route Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-red-600 mb-2">
                            <span>Route Progress</span>
                            <span>{Math.round((currentBusLocation / (selectedRoute.stops.length - 1)) * 100)}%</span>
                          </div>
                          <div className="w-full bg-red-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${(currentBusLocation / (selectedRoute.stops.length - 1)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-red-500 mt-1">
                            <span>Start</span>
                            <span>End</span>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-center mb-4">Route Stops</h4>
                      
                                              {/* Route Line */}
                        <div className="relative">
                          {/* Vertical Route Line */}
                          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-red-500 rounded-full shadow-lg"></div>
                          
                          {/* Route Direction Arrow */}
                          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rotate-45 border-r border-b border-white"></div>
                        
                        {/* Stops */}
                        {selectedRoute.stops.map((stop, index) => (
                          <div key={stop.id} className="relative flex items-start space-x-4 mb-6">
                            {/* Stop Marker */}
                            <div className="flex-shrink-0 relative">
                              <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                                index === 0 
                                  ? "bg-green-500" 
                                  : index === selectedRoute.stops.length - 1 
                                    ? "bg-red-500" 
                                    : "bg-blue-500"
                              }`}>
                                {index === 0 ? (
                                  <MapPin className="h-6 w-6 text-white" />
                                ) : index === selectedRoute.stops.length - 1 ? (
                                  <MapPin className="h-6 w-6 text-white" />
                                ) : (
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                )}
                              </div>
                              
                              {/* Stop Number with Bus Symbol */}
                              <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold relative">
                                {index + 1}
                                {/* Bus Symbol - Show at current location */}
                                {index === currentBusLocation && (
                                  <div className="absolute -top-6 -left-2 animate-bounce">
                                    <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-red-300">
                                      <Bus className="h-4 w-4" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Stop Information */}
                            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-1">
                                    {stop.name}
                                  </h5>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    <span>Stop {index + 1}</span>
                                    {index === 0 && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Starting Point
                                      </Badge>
                                    )}
                                    {index === selectedRoute.stops.length - 1 && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Destination
                                      </Badge>
                                    )}
                                    {index === currentBusLocation && (
                                      <Badge className="bg-orange-100 text-orange-800 text-xs animate-pulse">
                                        🚌 Bus Here
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Travel Time to Next Stop */}
                                <div className="text-right">
                                  {index < selectedRoute.stops.length - 1 ? (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2">
                                      <div className="text-xs text-blue-600 font-medium">To Next Stop</div>
                                      <div className="text-lg font-bold text-blue-700">
                                        {getTravelTime(index, index + 1)} min
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2">
                                      <div className="text-xs text-green-600 font-medium">Final Stop</div>
                                      <div className="text-lg font-bold text-green-700">Arrived</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Route Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <h5 className="font-semibold text-blue-900 mb-3">Route Summary</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedRoute.stops.length}</div>
                            <div className="text-blue-700">Total Stops</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{selectedRoute.stops[0]?.name}</div>
                            <div className="text-green-700">Starting Point</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{selectedRoute.stops[selectedRoute.stops.length - 1]?.name}</div>
                            <div className="text-red-700">Final Destination</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {selectedRoute.stops.slice(0, -1).reduce((total, _, index) => 
                                total + getTravelTime(index, index + 1), 0
                              )} min
                            </div>
                            <div className="text-purple-700">Total Travel Time</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !error ? (
                  <div className="h-full flex items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Bus Route Visualization
                      </h3>
                      <p className="text-muted-foreground">
                        Search for a route number to see its route and live
                        location
                      </p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {selectedRoute && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bus className="h-5 w-5 text-primary" />
                    <span>Detailed Route Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Bus Information */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Bus Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{selectedRoute.busNumber}</div>
                          <div className="text-xs text-gray-600">Route Number</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{selectedRoute.rating}</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{selectedRoute.capacity}</div>
                          <div className="text-xs text-gray-600">Capacity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{selectedRoute.currentPassengers}</div>
                          <div className="text-xs text-gray-600">Current Passengers</div>
                        </div>
                      </div>
                    </div>

                    {/* Stops Timeline */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Stops Timeline</h4>
                      <div className="space-y-3">
                        {selectedRoute.stops.map((stop, index) => (
                          <div
                            key={stop.id}
                            className="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0
                                  ? "bg-green-500"
                                  : index === selectedRoute.stops.length - 1
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{stop.name}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Stop {index + 1}</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {index === 0 && (
                                <Badge className="bg-green-100 text-green-800">Start</Badge>
                              )}
                              {index === selectedRoute.stops.length - 1 && (
                                <Badge className="bg-red-100 text-red-800">End</Badge>
                              )}
                              {index > 0 && index < selectedRoute.stops.length - 1 && (
                                <Badge className="bg-blue-100 text-blue-800">Stop</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Route Statistics */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Route Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{selectedRoute.stops.length}</div>
                          <div className="text-blue-700">Total Stops</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{selectedRoute.frequency}</div>
                          <div className="text-green-700">Service Frequency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">{selectedRoute.nextDeparture}</div>
                          <div className="text-purple-700">Next Departure</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
