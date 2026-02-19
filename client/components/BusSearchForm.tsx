import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  ArrowRight,
  Clock,
  Zap,
  Navigation as NavigationIcon,
  ChevronDown,
  X,
} from "lucide-react";

interface BusSearchFormProps {
  onSearch: (type: "number" | "route", data: any) => void;
  scrollToResults?: () => void;
  initialBusNumber?: string;
  showBusNumberSearch?: boolean; // New prop to control if route number search is shown
}

interface StopSuggestion {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface RouteRecommendation {
  id: string;
  from: string;
  to: string;
  routeNumber: string;
  routeName: string;
  frequency: string;
  estimatedTime: string;
  popularity: number;
}

export default function BusSearchForm({ onSearch, scrollToResults, initialBusNumber, showBusNumberSearch = true }: BusSearchFormProps) {
  const [busNumber, setBusNumber] = useState(initialBusNumber || "");
  const [fromStop, setFromStop] = useState("");
  const [toStop, setToStop] = useState("");
  const [activeTab, setActiveTab] = useState<"number" | "route">(showBusNumberSearch ? "number" : "route");
  
  // Suggestions state
  const [fromSuggestions, setFromSuggestions] = useState<StopSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<StopSuggestion[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Route recommendations state
  const [routeRecommendations, setRouteRecommendations] = useState<RouteRecommendation[]>([]);
  const [showRouteRecommendations, setShowRouteRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Update route number when initialBusNumber prop changes
  useEffect(() => {
    if (initialBusNumber) {
      setBusNumber(initialBusNumber);
    }
  }, [initialBusNumber]);

  // Fetch stop suggestions from GTFS data
  const fetchStopSuggestions = useCallback(async (query: string, type: 'from' | 'to') => {
    if (query.length < 2) {
      if (type === 'from') {
        setFromSuggestions([]);
        setShowFromSuggestions(false);
      } else {
        setToSuggestions([]);
        setShowToSuggestions(false);
      }
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await fetch(`/api/gtfs/stops?search=${encodeURIComponent(query)}&limit=10`);
      const result = await response.json();
      
      if (result.success) {
        const suggestions: StopSuggestion[] = result.data.map((stop: any) => ({
          id: stop.stop_id,
          name: stop.stop_name,
          lat: stop.stop_lat,
          lng: stop.stop_lon
        }));

        if (type === 'from') {
          setFromSuggestions(suggestions);
          setShowFromSuggestions(true);
        } else {
          setToSuggestions(suggestions);
          setShowToSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Fetch route recommendations based on starting point
  const fetchRouteRecommendations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setRouteRecommendations([]);
      setShowRouteRecommendations(false);
      return;
    }

    try {
      setLoadingRecommendations(true);
      
      // Route recommendations based on actual GTFS data from your routes
      const sampleRecommendations: RouteRecommendation[] = [
        {
          id: "rec_1",
          from: "Rithala",
          to: "Dilshad Garden",
          routeNumber: "R_RD",
          routeName: "RED_Rithala to Dilshad Garden",
          frequency: "Every 3-5 mins",
          estimatedTime: "45 mins",
          popularity: 95
        },
        {
          id: "rec_2",
          from: "Huda City Centre",
          to: "Qutab Minar",
          routeNumber: "Y_HQ",
          routeName: "YELLOW_Huda City Centre to Qutab Minar",
          frequency: "Every 2-4 mins",
          estimatedTime: "35 mins",
          popularity: 92
        },
        {
          id: "rec_3",
          from: "Dwarka Sector 21",
          to: "Noida Electronic City",
          routeNumber: "B_DN",
          routeName: "BLUE_Dwarka Sector - 21 to Noida Electronic City",
          frequency: "Every 4-6 mins",
          estimatedTime: "55 mins",
          popularity: 88
        },
        {
          id: "rec_4",
          from: "Majlis Park",
          to: "Shiv Vihar",
          routeNumber: "P_MS",
          routeName: "PINK_Majlis Park to Shiv Vihar",
          frequency: "Every 3-5 mins",
          estimatedTime: "40 mins",
          popularity: 85
        },
        {
          id: "rec_5",
          from: "Janak Puri West",
          to: "Botanical Garden",
          routeNumber: "M_JB",
          routeName: "MAGENTA_Janak Puri West to Botanical Garden",
          frequency: "Every 4-6 mins",
          estimatedTime: "50 mins",
          popularity: 82
        },
        {
          id: "rec_6",
          from: "Kashmere Gate",
          to: "Badarpur Border",
          routeNumber: "V_KB",
          routeName: "VIOLET_Kashmere Gate to Badarpur Border",
          frequency: "Every 2-3 mins",
          estimatedTime: "25 mins",
          popularity: 90
        },
        {
          id: "rec_7",
          from: "Dwarka Sector 21",
          to: "Vaishali",
          routeNumber: "B_DV",
          routeName: "BLUE_Dwarka Sector - 21 to Vaishali",
          frequency: "Every 3-4 mins",
          estimatedTime: "20 mins",
          popularity: 87
        },
        {
          id: "rec_8",
          from: "Kirti Nagar",
          to: "Brigadier Hoshiyar Singh",
          routeNumber: "G_KB",
          routeName: "GREEN_Kirti Nagar to Brigadier Hoshiyar Singh",
          frequency: "Every 4-5 mins",
          estimatedTime: "30 mins",
          popularity: 80
        },
        {
          id: "rec_9",
          from: "Inderlok",
          to: "Brigadier Hoshiyar Singh",
          routeNumber: "G_IB",
          routeName: "GREEN_Inderlok to Brigadier Hoshiyar Singh",
          frequency: "Every 5-7 mins",
          estimatedTime: "15 mins",
          popularity: 75
        },
        {
          id: "rec_10",
          from: "Dwarka Sector 21",
          to: "New Delhi",
          routeNumber: "O_DN",
          routeName: "ORANGE/AIRPORT_Dwarka Sector - 21 to New Delhi",
          frequency: "Every 6-8 mins",
          estimatedTime: "60 mins",
          popularity: 78
        },
        {
          id: "rec_11",
          from: "Noida Sector 51",
          to: "Noida Sector 142",
          routeNumber: "A_NN",
          routeName: "AQUA_Noida Sector 51 to Noida Sector 142",
          frequency: "Every 4-6 mins",
          estimatedTime: "25 mins",
          popularity: 70
        },
        {
          id: "rec_12",
          from: "Sector 55-56",
          to: "Phase 3",
          routeNumber: "R_SP",
          routeName: "RAPID_Sector 55-56 (Rapid Metro) to Phase 3 (Rapid Metro)",
          frequency: "Every 3-5 mins",
          estimatedTime: "20 mins",
          popularity: 65
        }
      ];

      // Filter recommendations based on query
      const filteredRecommendations = sampleRecommendations.filter(rec => 
        rec.from.toLowerCase().includes(query.toLowerCase()) ||
        rec.to.toLowerCase().includes(query.toLowerCase()) ||
        rec.routeName.toLowerCase().includes(query.toLowerCase())
      );

      setRouteRecommendations(filteredRecommendations);
      setShowRouteRecommendations(true);
    } catch (error) {
      console.error('Error fetching route recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  const handleBusNumberSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (busNumber.trim()) {
      onSearch("number", { busNumber: busNumber.trim() });
      // Auto-scroll to results if scrollToResults function is provided
      if (scrollToResults) {
        setTimeout(() => scrollToResults(), 100);
      }
    }
  };

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStop.trim() && toStop.trim()) {
      onSearch("route", { from: fromStop.trim(), to: toStop.trim() });
      // Auto-scroll to results if scrollToResults function is provided
      if (scrollToResults) {
        setTimeout(() => scrollToResults(), 100);
      }
    }
  };

  const quickActions = [
    { icon: Search, label: "Track Bus", desc: "Live location" },
    { icon: Clock, label: "Schedules", desc: "Timing info" },
    { icon: MapPin, label: "Routes", desc: "All stops" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto bg-red-500 rounded-3xl p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="bg-red-500 p-3 rounded-2xl shadow-lg">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Plan Your Journey
          </h2>
        </div>
        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto px-4">
          Find the best routes between bus stops. Get real-time
          updates and never miss your ride.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-110 border-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 overflow-hidden"
          >
            <CardContent className="p-4 text-center relative">
              {/* Enhanced hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              
              {/* Enhanced hover border effect */}
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-white/30 transition-all duration-500"></div>
              
              {/* Content */}
              <div className="relative">
                <action.icon className="h-6 w-6 mx-auto mb-2 text-white group-hover:scale-125 group-hover:rotate-3 transition-all duration-500" />
                <div className="text-sm font-semibold text-white group-hover:tracking-wide transition-all duration-300">
                  {action.label}
                </div>
                <div className="text-xs text-white/80 group-hover:text-white group-hover:font-medium transition-all duration-300">{action.desc}</div>
              </div>
              
              {/* Enhanced hover glow effect */}
              <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Search Section */}
      <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Tab Selection - Only show if bus number search is enabled */}
          {showBusNumberSearch && (
            <div className="bg-red-500 p-4 sm:p-6">
              <div className="flex gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-1 sm:p-2">
                <button
                  onClick={() => setActiveTab("number")}
                  className={`group flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-500 ${
                    activeTab === "number"
                      ? "bg-white text-red-500 shadow-lg font-semibold scale-105"
                      : "text-white hover:bg-white/20 hover:scale-105"
                  }`}
                >
                  <Search className={`h-4 sm:h-5 w-4 sm:w-5 transition-transform duration-300 ${
                    activeTab === "number" ? "scale-110" : "group-hover:scale-110"
                  }`} />
                  <span className={`text-sm sm:text-base transition-all duration-300 ${
                    activeTab === "number" ? "tracking-wide" : "group-hover:tracking-wide"
                  }`}>Route Number</span>
                </button>
                <button
                  onClick={() => setActiveTab("route")}
                  className={`group flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-500 ${
                    activeTab === "route"
                      ? "bg-white text-black shadow-lg font-semibold scale-105"
                      : "text-white hover:bg-white/20 hover:scale-105"
                  }`}
                >
                  <MapPin className={`h-4 sm:h-5 w-4 sm:w-5 transition-transform duration-300 ${
                    activeTab === "route" ? "scale-110" : "group-hover:scale-110"
                  }`} />
                  <span className={`text-sm sm:text-base transition-all duration-300 ${
                    activeTab === "route" ? "tracking-wide" : "group-hover:tracking-wide"
                  }`}>Route Planning</span>
                </button>
              </div>
            </div>
          )}

          {/* Search Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "number" ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Search by Route Number
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Enter the route number to get live tracking and route
                    information
                  </p>
                </div>

                <form onSubmit={handleBusNumberSearch} className="space-y-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g., 101, AC-42, DLB-205"
                      value={busNumber}
                      onChange={(e) => setBusNumber(e.target.value)}
                      className="h-12 sm:h-14 text-base sm:text-lg pl-10 sm:pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition-all duration-300 bg-gray-50 hover:bg-white hover:border-gray-300"
                    />
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                    {busNumber && (
                      <button
                        type="button"
                        onClick={() => setBusNumber("")}
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!busNumber.trim()}
                    className="group relative w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white text-red-500 hover:bg-gray-50 hover:text-red-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Enhanced hover background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-400 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"></div>
                    
                    {/* Enhanced hover border effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-300 transition-all duration-500"></div>
                    
                    {/* Enhanced hover shadow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-red-500 opacity-0 group-hover:opacity-5 blur-xl transition-all duration-500 group-hover:scale-110"></div>
                    
                    {/* Button content */}
                    <div className="relative flex items-center justify-center">
                      <Zap className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="group-hover:tracking-wide transition-all duration-300">Track This Bus</span>
                    </div>
                    
                    {/* Enhanced hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 via-red-500/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                  </Button>

                  {/* Clear Form Button - Only show when form is auto-populated */}
                  {initialBusNumber && busNumber === initialBusNumber && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setBusNumber("");
                        setFromStop("");
                        setToStop("");
                      }}
                      className="w-full h-10 text-sm font-medium border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Clear Form
                    </Button>
                  )}
                </form>

                {/* Popular Buses */}
                <div className="mt-6 sm:mt-8">
                  <p className="text-sm text-gray-500 mb-3">Popular buses:</p>
                  <div className="flex flex-wrap gap-2">
                    {["101", "205", "AC-42", "DLB-104", "Red Line"].map(
                      (bus) => (
                        <Badge
                          key={bus}
                          variant="outline"
                          className="group cursor-pointer hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-300 text-xs sm:text-sm hover:scale-110 hover:shadow-md"
                          onClick={() => setBusNumber(bus)}
                        >
                          <span className="group-hover:tracking-wide transition-all duration-300">{bus}</span>
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Plan Your Route
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Find the best buses between any two stops
                  </p>
                </div>

                <form onSubmit={handleRouteSearch} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="From (Starting point)"
                        value={fromStop}
                        onChange={(e) => {
                          setFromStop(e.target.value);
                          fetchStopSuggestions(e.target.value, 'from');
                          fetchRouteRecommendations(e.target.value);
                        }}
                        onFocus={() => {
                          if (fromStop.length >= 2) {
                            setShowFromSuggestions(true);
                            setShowRouteRecommendations(true);
                          }
                        }}
                        onBlur={() => setTimeout(() => {
                          setShowFromSuggestions(false);
                          setShowRouteRecommendations(false);
                        }, 200)}
                        className="h-12 sm:h-14 text-base sm:text-lg pl-10 sm:pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition-all duration-300 bg-gray-50 hover:bg-white hover:border-gray-300"
                      />
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
                      
                      {/* From Suggestions Dropdown */}
                      {showFromSuggestions && (fromSuggestions.length > 0 || loadingSuggestions) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {loadingSuggestions ? (
                            <div className="p-3 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mx-auto"></div>
                              <span className="ml-2">Loading suggestions...</span>
                            </div>
                          ) : (
                            fromSuggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                className="p-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  setFromStop(suggestion.name);
                                  setShowFromSuggestions(false);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium">{suggestion.name}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Route Recommendations Dropdown */}
                      {showRouteRecommendations && (routeRecommendations.length > 0 || loadingRecommendations) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-blue-700">Recommended Routes</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">Popular routes from similar starting points</p>
                          </div>
                          
                          {loadingRecommendations ? (
                            <div className="p-3 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                              <span className="ml-2">Loading recommendations...</span>
                            </div>
                          ) : (
                            routeRecommendations.map((recommendation) => (
                              <div
                                key={recommendation.id}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                                onClick={() => {
                                  setFromStop(recommendation.from);
                                  setToStop(recommendation.to);
                                  setShowRouteRecommendations(false);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-blue-600">{recommendation.routeNumber.charAt(0)}</span>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900">{recommendation.routeNumber}</span>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-green-600 font-medium">{recommendation.popularity}% popular</span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">
                                      {recommendation.from} → {recommendation.to}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{recommendation.estimatedTime}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        <span>{recommendation.frequency}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>


                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="To (Destination)"
                        value={toStop}
                        onChange={(e) => {
                          setToStop(e.target.value);
                          fetchStopSuggestions(e.target.value, 'to');
                        }}
                        onFocus={() => toStop.length >= 2 && setShowToSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                        className="h-12 sm:h-14 text-base sm:text-lg pl-10 sm:pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition-all duration-300 bg-gray-50 hover:bg-white hover:border-gray-300"
                      />
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
                      
                      {/* To Suggestions Dropdown */}
                      {showToSuggestions && (toSuggestions.length > 0 || loadingSuggestions) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {loadingSuggestions ? (
                            <div className="p-3 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mx-auto"></div>
                              <span className="ml-2">Loading suggestions...</span>
                            </div>
                          ) : (
                            toSuggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                className="p-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  setToStop(suggestion.name);
                                  setShowToSuggestions(false);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-red-500" />
                                  <span className="text-sm font-medium">{suggestion.name}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!fromStop.trim() || !toStop.trim()}
                    className="group relative w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white text-red-500 hover:bg-gray-50 hover:text-red-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Enhanced hover background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-400 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"></div>
                    
                    {/* Enhanced hover border effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-300 transition-all duration-500"></div>
                    
                    {/* Enhanced hover shadow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-red-500 opacity-0 group-hover:opacity-5 blur-xl transition-all duration-500 group-hover:scale-110"></div>
                    
                    {/* Button content */}
                    <div className="relative flex items-center justify-center">
                      <NavigationIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:tracking-wide transition-all duration-300">Find Best Routes</span>
                    </div>
                    
                    {/* Enhanced hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 via-red-500/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                  </Button>
                </form>

                {/* Quick Route Suggestions */}
                <div className="mt-6 sm:mt-8">
                  <p className="text-sm text-gray-500 mb-3">Popular bus routes:</p>
                  <div className="space-y-2">
                    {[
                      { from: "Dilshad Garden", to: "Rithala" },
                      { from: "Huda City Centre", to: "Qutab Minar" },
                      { from: "Dwarka Sector 21", to: "Noida Electronic City" },
                      { from: "Majlis Park", to: "Shiv Vihar" },
                      { from: "Janak Puri West", to: "Botanical Garden" },
                    ].map((route, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-red-50 hover:border hover:border-red-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                        onClick={() => {
                          setFromStop(route.from);
                          setToStop(route.to);
                        }}
                      >
                        <span className="text-xs sm:text-sm font-medium group-hover:text-red-700 transition-colors">
                          {route.from} → {route.to}
                        </span>
                        <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="text-center p-3 sm:p-4">
          <div className="bg-red-100 rounded-full p-2 sm:p-3 w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3">
                            <Clock className="h-6 w-6 text-red-500" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
            Real-time Updates
          </h4>
          <p className="text-xs sm:text-sm text-gray-600">
            Live bus locations and arrival times
          </p>
        </div>
        <div className="text-center p-3 sm:p-4">
          <div className="bg-red-100 rounded-full p-2 sm:p-3 w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3">
            <MapPin className="h-6 w-6 text-black" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
            Smart Routing
          </h4>
          <p className="text-xs sm:text-sm text-gray-600">
            Best routes with transfer options
          </p>
        </div>
        <div className="text-center p-3 sm:p-4">
          <div className="bg-red-100 rounded-full p-2 sm:p-3 w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3">
                            <Zap className="h-6 w-6 text-red-500" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
            Instant Results
          </h4>
          <p className="text-xs sm:text-sm text-gray-600">
            Fast search with accurate data
          </p>
        </div>
      </div>
    </div>
  );
}
