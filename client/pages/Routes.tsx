import Navigation from "@/components/Navigation";
import RouteMap from "@/components/RouteMap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MapPin, Navigation as NavigationIcon, Search, Bus, Clock, Users, Star, AlertCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface GTFSRoute {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string;
  route_type: number;
  route_url?: string;
  route_color: string;
  route_text_color: string;
  route_sort_order?: number;
  continuous_pickup?: number;
  continuous_drop_off?: number;
  isActive: boolean;
}

interface RouteWithStops {
  id: string;
  name: string;
  shortName: string;
  stops: Stop[];
  routeType: number;
  agencyId: string;
  routeColor: string;
  routeTextColor: string;
  isActive: boolean;
  description: string;
}

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState<RouteWithStops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch GTFS routes
      const routesResponse = await fetch('/api/gtfs/routes?limit=50');
      const routesResult = await routesResponse.json();
      
      if (!routesResult.success) {
        throw new Error('Failed to fetch routes');
      }

      // Fetch some stops for each route (simplified - in real app you'd fetch stops per route)
      const stopsResponse = await fetch('/api/gtfs/stops?limit=100');
      const stopsResult = await stopsResponse.json();
      
      const allStops: Stop[] = stopsResult.success ? stopsResult.data.map((stop: any) => ({
        id: stop.stop_id,
        name: stop.stop_name,
        lat: stop.stop_lat,
        lng: stop.stop_lon
      })) : [];

      // Convert GTFS routes to our format
      const convertedRoutes: RouteWithStops[] = routesResult.data.map((route: any) => ({
        id: route.route_id, // Use route_id instead of _id
        name: route.route_long_name || `${route.route_short_name} Route`,
        shortName: route.route_short_name?.trim() || route.route_id,
        stops: allStops.slice(0, Math.floor(Math.random() * 5) + 3), // Random 3-7 stops for demo
        routeType: route.route_type,
        agencyId: route.agency_id,
        routeColor: route.route_color,
        routeTextColor: route.route_text_color,
        isActive: route.isActive,
        description: route.route_desc || ''
      }));

      setRoutes(convertedRoutes);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(search.toLowerCase()) ||
    route.shortName.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100/40 ">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="rounded-3xl bg-[rgba(220,38,38,1)] text-white shadow-xl px-8 py-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3 justify-center md:justify-start">
              <NavigationIcon className="h-9 w-9 text-white" />
              Bus Routes
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto md:mx-0">
              Explore real bus routes, view all stops, and plan your journey
              with confidence. Find the most efficient way to reach your
              destination using live GTFS data!
            </p>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="bg-white/90  rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-xs">
              <Search className="h-6 w-6 text-primary mb-2" />
              <input
                type="text"
                placeholder="Search routes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-primary/30 px-4 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white "
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading bus routes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Routes</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchRoutes}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Routes List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredRoutes.length === 0 && (
              <div className="text-center text-lg text-muted-foreground py-12">
                No routes found. Try a different search.
              </div>
            )}
            
            <Accordion type="single" collapsible className="space-y-4">
              {filteredRoutes.map((route) => (
                <AccordionItem
                  key={route.id}
                  value={route.id}
                  className="rounded-2xl border-2 border-primary/10 bg-white/90 shadow hover:shadow-2xl transition-shadow"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full text-left">
                      <div className="flex items-center gap-3">
                        <Bus className="h-6 w-6 text-primary" />
                        <div>
                          <div className="flex items-center gap-2 text-primary text-xl font-bold">
                            <span>Route {route.shortName}</span>
                            {route.routeType === 1 && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Bus
                              </span>
                            )}
                            {route.isActive && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Live
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <div className="font-medium">{route.name}</div>
                            <div className="text-xs">
                              {route.agencyId} • {route.routeType === 1 ? 'Bus Route' : route.routeType === 2 ? 'Bus Route' : 'Transport Service'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{route.stops.length} stops</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {route.description && (
                        <div>
                          <span className="font-semibold text-primary">Description:</span>
                          <p className="text-sm text-muted-foreground mt-1">{route.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-semibold text-primary">Stops ({route.stops.length}):</span>
                        <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                          {route.stops.map((stop) => (
                            <li key={stop.id} className="text-sm">
                              {stop.name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-foreground font-medium">
                            {route.routeType === 1 ? 'Every 10-15 min' : 'Every 15-20 min'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-foreground font-medium">
                            {route.routeType === 1 ? '50 capacity' : '30 capacity'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <RouteMap stops={route.stops} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
