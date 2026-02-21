import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Route as RouteIcon, Download, Navigation as NavigationIcon, Search, Save, CheckCircle } from "lucide-react";
import { ProposedRouteSegment, RouteOverlapResult } from "@shared/types";

export default function AdminRoutePlanner() {
  const [name, setName] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [path, setPath] = useState<Array<{ lat: number; lng: number }>>([
    { lat: 28.6139, lng: 77.2090 },
    { lat: 28.5562, lng: 77.1000 },
  ]);
  const [overlap, setOverlap] = useState<RouteOverlapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState<string | null>(null);

  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers: HeadersInit = useMemo(() => ({ "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) }), [adminToken]);

  const computeOverlap = async () => {
    setLoading(true);
    try {
      const body: ProposedRouteSegment = { id: "temp", name, path };
      const res = await fetch("/api/routes/overlap", { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      setOverlap(data);
    } finally {
      setLoading(false);
    }
  };

  const saveRoute = async () => {
    if (!name || !fromCoords || !toCoords) {
      alert("Please enter route name and select start/end points");
      return;
    }

    setSaveLoading(true);
    try {
      const stops = [
        { name: fromLocation || "Start", lat: fromCoords.lat, lng: fromCoords.lng },
        { name: toLocation || "End", lat: toCoords.lat, lng: toCoords.lng }
      ];

      const res = await fetch("/api/routes", {
        method: "POST",
        headers,
        body: JSON.stringify({
          routeName: name,
          stops,
          busNumber: "TBD",
          frequency: "Every 20 mins",
          capacity: 50
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save route");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving route");
    } finally {
      setSaveLoading(false);
    }
  };

  const geocodeLocation = async (location: string, type: 'from' | 'to') => {
    setSearchingLocation(type);
    try {
      // Try with specific Delhi filter first
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=in&state=Delhi`
      );
      let data = await response.json();

      // If not found, try a broader search in India
      if (!data || data.length === 0) {
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=in`
        );
        data = await response.json();
      }

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };

        if (type === 'from') {
          setFromCoords(coords);
          // Update path if toCoords is already set
          if (toCoords) setPath([coords, toCoords]);
        } else {
          setToCoords(coords);
          // Update path if fromCoords is already set
          if (fromCoords) setPath([fromCoords, coords]);
        }
      } else {
        alert(`Location "${location}" not found. Try adding more details like "Old Delhi" or just "Red Fort".`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error connecting to map service. Please check your internet connection.');
    } finally {
      setSearchingLocation(null);
    }
  };

  const showRouteOnMap = () => {
    if (fromCoords && toCoords) {
      setPath([fromCoords, toCoords]);
    }
  };

  const addPoint = () => setPath((p) => [...p, p[p.length - 1]]);
  const updatePoint = (index: number, key: "lat" | "lng", value: string) => {
    const v = parseFloat(value); if (Number.isNaN(v)) return; setPath((p) => p.map((pt, i) => (i === index ? { ...pt, [key]: v } : pt)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild><Link to="/admin"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Route Planner</h1>
              <p className="text-gray-600">Draw proposed routes and analyze overlaps with existing network</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={computeOverlap} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Analyze Overlap
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={saveRoute}
              disabled={saveLoading || !name || !fromCoords || !toCoords}
            >
              {saveSuccess ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saveSuccess ? "Saved!" : saveLoading ? "Saving..." : "Save Route"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <NavigationIcon className="h-5 w-5 mr-2" />
                  Route Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">From (Starting Point)</label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10"
                          value={fromLocation}
                          onChange={(e) => setFromLocation(e.target.value)}
                          placeholder="e.g. Connaught Place, Delhi"
                        />
                        <Button
                          variant="outline"
                          onClick={() => geocodeLocation(fromLocation, 'from')}
                          disabled={!fromLocation || searchingLocation === 'from'}
                        >
                          {searchingLocation === 'from' ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {fromCoords && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          ✓ Found: {fromCoords.lat.toFixed(4)}, {fromCoords.lng.toFixed(4)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">To (Destination)</label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10"
                          value={toLocation}
                          onChange={(e) => setToLocation(e.target.value)}
                          placeholder="e.g. India Gate, Delhi"
                        />
                        <Button
                          variant="outline"
                          onClick={() => geocodeLocation(toLocation, 'to')}
                          disabled={!toLocation || searchingLocation === 'to'}
                        >
                          {searchingLocation === 'to' ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {toCoords && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          ✓ Found: {toCoords.lat.toFixed(4)}, {toCoords.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>

                  {fromCoords && toCoords && (
                    <Button
                      onClick={showRouteOnMap}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RouteIcon className="h-4 w-4 mr-2" />
                      Show Route on Map
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RouteIcon className="h-5 w-5 mr-2" />
                  Map View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Interactive Map Coming Soon</h3>
                    <p className="text-sm mb-4">Map functionality will be available after location search</p>
                    {fromCoords && toCoords ? (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>Route Found:</strong> {fromLocation} → {toLocation}
                        </p>
                        <div className="text-xs text-blue-600 space-y-1">
                          <div>From: {fromCoords.lat.toFixed(4)}, {fromCoords.lng.toFixed(4)}</div>
                          <div>To: {toCoords.lat.toFixed(4)}, {toCoords.lng.toFixed(4)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Enter starting point and destination above to see route details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Route Name</label>
                    <Input
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. New South Link"
                    />
                  </div>

                  {overlap && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium text-blue-900">Overlap Analysis</div>
                        <div className="mt-2 text-blue-700">
                          Overlap Score: <strong>{(overlap.overlapRatio * 100).toFixed(0)}%</strong>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {overlap.overlappingSegments.map((o) => (
                            <li key={o.routeId} className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-blue-600" />
                              <span className="text-gray-700">{o.routeId}</span>
                              <span className="text-blue-600 font-medium">{o.percent}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


