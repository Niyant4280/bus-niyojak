import { Request, Response } from "express";
import { RouteModel } from "../models/Route.js";

// Complete GTFS routes data from your CSV file
const mockGTFSRoutes = [
  {
    route_id: "0",
    agency_id: "DMRC",
    route_short_name: "R_RD",
    route_long_name: "RED_Rithala to Dilshad Garden",
    route_desc: "Delhi Metro Red Line",
    route_type: 1,
    route_color: "FF0000",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "1",
    agency_id: "DMRC",
    route_short_name: "R_RS",
    route_long_name: "RED_Rithala to Shaheed Sthal (New Bus Adda)",
    route_desc: "Delhi Metro Red Line",
    route_type: 1,
    route_color: "FF0000",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "2",
    agency_id: "DMRC",
    route_short_name: "Y_HS",
    route_long_name: "YELLOW_Huda City Centre to Samaypur Badli",
    route_desc: "Delhi Metro Yellow Line",
    route_type: 1,
    route_color: "FFFF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "3",
    agency_id: "DMRC",
    route_short_name: "Y_QV",
    route_long_name: "YELLOW_Qutab Minar to Vishwavidyalaya",
    route_desc: "Delhi Metro Yellow Line",
    route_type: 1,
    route_color: "FFFF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "4",
    agency_id: "DMRC",
    route_short_name: "Y_HQ",
    route_long_name: "YELLOW_Huda City Centre to Qutab Minar",
    route_desc: "Delhi Metro Yellow Line",
    route_type: 1,
    route_color: "FFFF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "5",
    agency_id: "DMRC",
    route_short_name: "B_DN",
    route_long_name: "BLUE_Dwarka Sector - 21 to Noida Electronic City",
    route_desc: "Delhi Metro Blue Line",
    route_type: 1,
    route_color: "0000FF",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "6",
    agency_id: "DMRC",
    route_short_name: "B_DV",
    route_long_name: "BLUE_Dwarka Sector - 21 to Vaishali",
    route_desc: "Delhi Metro Blue Line",
    route_type: 1,
    route_color: "0000FF",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "7",
    agency_id: "DMRC",
    route_short_name: "G_KB",
    route_long_name: "GREEN_Kirti Nagar to Brigadier Hoshiyar Singh",
    route_desc: "Delhi Metro Green Line",
    route_type: 1,
    route_color: "00FF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "8",
    agency_id: "DMRC",
    route_short_name: "G_IB",
    route_long_name: "GREEN_Inderlok to Brigadier Hoshiyar Singh",
    route_desc: "Delhi Metro Green Line",
    route_type: 1,
    route_color: "00FF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "9",
    agency_id: "DMRC",
    route_short_name: "V_KB",
    route_long_name: "VIOLET_Kashmere Gate to Badarpur Border",
    route_desc: "Delhi Metro Violet Line",
    route_type: 1,
    route_color: "800080",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "10",
    agency_id: "DMRC",
    route_short_name: "V_KR",
    route_long_name: "VIOLET_Kashmere Gate to Raja Nahar Singh",
    route_desc: "Delhi Metro Violet Line",
    route_type: 1,
    route_color: "800080",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "11",
    agency_id: "DMRC",
    route_short_name: "P_MS",
    route_long_name: "PINK_Majlis Park to Shiv Vihar",
    route_desc: "Delhi Metro Pink Line",
    route_type: 1,
    route_color: "FF69B4",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "12",
    agency_id: "DMRC",
    route_short_name: "M_JB",
    route_long_name: "MAGENTA_Janak Puri West to Botanical Garden",
    route_desc: "Delhi Metro Magenta Line",
    route_type: 1,
    route_color: "FF00FF",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "13",
    agency_id: "DMRC",
    route_short_name: "G_DD",
    route_long_name: "GRAY_Dwarka to Dhansa Bus Stand",
    route_desc: "Delhi Metro Gray Line",
    route_type: 1,
    route_color: "808080",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "14",
    agency_id: "DMRC",
    route_short_name: "O_DN",
    route_long_name: "ORANGE/AIRPORT_Dwarka Sector - 21 to New Delhi",
    route_desc: "Delhi Metro Orange/Airport Line",
    route_type: 1,
    route_color: "FFA500",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "15",
    agency_id: "DMRC",
    route_short_name: "R_SP",
    route_long_name: "RAPID_Sector 55-56 (Rapid Metro) to Phase 3 (Rapid Metro)",
    route_desc: "Delhi Metro Rapid Line",
    route_type: 1,
    route_color: "FF4500",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "16",
    agency_id: "DMRC",
    route_short_name: "A_NN",
    route_long_name: "AQUA_Noida Sector 51 to Noida Sector 142",
    route_desc: "Delhi Metro Aqua Line",
    route_type: 1,
    route_color: "00FFFF",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "17",
    agency_id: "DMRC",
    route_short_name: "A_ND",
    route_long_name: "AQUA_Noida Sector 142 to Depot Station",
    route_desc: "Delhi Metro Aqua Line",
    route_type: 1,
    route_color: "00FFFF",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "18",
    agency_id: "DMRC",
    route_short_name: "R_RD_R",
    route_long_name: "RED_Dilshad Garden  to Rithala",
    route_desc: "Delhi Metro Red Line (Reverse)",
    route_type: 1,
    route_color: "FF0000",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "19",
    agency_id: "DMRC",
    route_short_name: "R_RS_R",
    route_long_name: "RED_Shaheed Sthal (New Bus Adda) to Rithala",
    route_desc: "Delhi Metro Red Line (Reverse)",
    route_type: 1,
    route_color: "FF0000",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "20",
    agency_id: "DMRC",
    route_short_name: "Y_HS_R",
    route_long_name: "YELLOW_Samaypur Badli to Huda City Centre",
    route_desc: "Delhi Metro Yellow Line (Reverse)",
    route_type: 1,
    route_color: "FFFF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "21",
    agency_id: "DMRC",
    route_short_name: "Y_QV_R",
    route_long_name: "YELLOW_Vishwavidyalaya to Qutab Minar",
    route_desc: "Delhi Metro Yellow Line (Reverse)",
    route_type: 1,
    route_color: "FFFF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "22",
    agency_id: "DMRC",
    route_short_name: "Y_HQ_R",
    route_long_name: "YELLOW_Qutab Minar  to Huda City Centre",
    route_desc: "Delhi Metro Yellow Line (Reverse)",
    route_type: 1,
    route_color: "FFFF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "23",
    agency_id: "DMRC",
    route_short_name: "B_DN_R",
    route_long_name: "BLUE_Noida Electronic City to Dwarka Sector - 21",
    route_desc: "Delhi Metro Blue Line (Reverse)",
    route_type: 1,
    route_color: "0000FF",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "24",
    agency_id: "DMRC",
    route_short_name: "B_DV_R",
    route_long_name: "BLUE_Vaishali to Dwarka Sector - 21",
    route_desc: "Delhi Metro Blue Line (Reverse)",
    route_type: 1,
    route_color: "0000FF",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "25",
    agency_id: "DMRC",
    route_short_name: "G_KB_R",
    route_long_name: "GREEN_Brigadier Hoshiyar Singh to Kirti Nagar",
    route_desc: "Delhi Metro Green Line (Reverse)",
    route_type: 1,
    route_color: "00FF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "26",
    agency_id: "DMRC",
    route_short_name: "G_IB_R",
    route_long_name: "GREEN_Brigadier Hoshiyar Singh to Inderlok",
    route_desc: "Delhi Metro Green Line (Reverse)",
    route_type: 1,
    route_color: "00FF00",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "27",
    agency_id: "DMRC",
    route_short_name: "V_KB_R",
    route_long_name: "VIOLET_Badarpur Border to Kashmere Gate",
    route_desc: "Delhi Metro Violet Line (Reverse)",
    route_type: 1,
    route_color: "800080",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "28",
    agency_id: "DMRC",
    route_short_name: "V_KR_R",
    route_long_name: "VIOLET_Raja Nahar Singh to Kashmere Gate",
    route_desc: "Delhi Metro Violet Line (Reverse)",
    route_type: 1,
    route_color: "800080",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "29",
    agency_id: "DMRC",
    route_short_name: "P_MS_R",
    route_long_name: "PINK_Shiv Vihar to Majlis Park",
    route_desc: "Delhi Metro Pink Line (Reverse)",
    route_type: 1,
    route_color: "FF69B4",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "30",
    agency_id: "DMRC",
    route_short_name: "M_JB_R",
    route_long_name: "MAGENTA_Botanical Garden to Janak Puri West",
    route_desc: "Delhi Metro Magenta Line (Reverse)",
    route_type: 1,
    route_color: "FF00FF",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "31",
    agency_id: "DMRC",
    route_short_name: "G_DD_R",
    route_long_name: "GRAY_Dhansa Bus Stand to Dwarka",
    route_desc: "Delhi Metro Gray Line (Reverse)",
    route_type: 1,
    route_color: "808080",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "32",
    agency_id: "DMRC",
    route_short_name: "O_DN_R",
    route_long_name: "ORANGE/AIRPORT_New Delhi to Dwarka Sector - 21",
    route_desc: "Delhi Metro Orange/Airport Line (Reverse)",
    route_type: 1,
    route_color: "FFA500",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "33",
    agency_id: "DMRC",
    route_short_name: "R_SP_R",
    route_long_name: "RAPID_Phase 3 (Rapid Metro) to Sector 55-56 (Rapid Metro)",
    route_desc: "Delhi Metro Rapid Line (Reverse)",
    route_type: 1,
    route_color: "FF4500",
    route_text_color: "FFFFFF",
    isActive: true
  },
  {
    route_id: "34",
    agency_id: "DMRC",
    route_short_name: "A_NN_R",
    route_long_name: "AQUA_Noida Sector 142 to Noida Sector 51",
    route_desc: "Delhi Metro Aqua Line (Reverse)",
    route_type: 1,
    route_color: "00FFFF",
    route_text_color: "000000",
    isActive: true
  },
  {
    route_id: "35",
    agency_id: "DMRC",
    route_short_name: "A_ND_R",
    route_long_name: "AQUA_Depot Station to Noida Sector 142",
    route_desc: "Delhi Metro Aqua Line (Reverse)",
    route_type: 1,
    route_color: "00FFFF",
    route_text_color: "000000",
    isActive: true
  }
];

const mockGTFSStops = [
  {
    stop_id: "1",
    stop_name: "Central Secretariat",
    stop_desc: "Central Secretariat Metro Station",
    stop_lat: 28.6129,
    stop_lon: 77.2090,
    isActive: true
  },
  {
    stop_id: "2",
    stop_name: "Rajiv Chowk",
    stop_desc: "Rajiv Chowk Metro Station",
    stop_lat: 28.6304,
    stop_lon: 77.2177,
    isActive: true
  },
  {
    stop_id: "3",
    stop_name: "Kashmere Gate",
    stop_desc: "Kashmere Gate Metro Station",
    stop_lat: 28.6667,
    stop_lon: 77.2167,
    isActive: true
  },
  {
    stop_id: "4",
    stop_name: "Connaught Place",
    stop_desc: "Connaught Place Metro Station",
    stop_lat: 28.6304,
    stop_lon: 77.2177,
    isActive: true
  },
  {
    stop_id: "5",
    stop_name: "India Gate",
    stop_desc: "India Gate Metro Station",
    stop_lat: 28.6129,
    stop_lon: 77.2295,
    isActive: true
  },
  {
    stop_id: "6",
    stop_name: "Lal Qila",
    stop_desc: "Lal Qila Metro Station",
    stop_lat: 28.6559,
    stop_lon: 77.2315,
    isActive: true
  },
  {
    stop_id: "7",
    stop_name: "Jama Masjid",
    stop_desc: "Jama Masjid Metro Station",
    stop_lat: 28.6504,
    stop_lon: 77.2315,
    isActive: true
  },
  {
    stop_id: "8",
    stop_name: "Chandni Chowk",
    stop_desc: "Chandni Chowk Metro Station",
    stop_lat: 28.6448,
    stop_lon: 77.2167,
    isActive: true
  },
  {
    stop_id: "9",
    stop_name: "New Delhi Railway Station",
    stop_desc: "New Delhi Railway Station Metro",
    stop_lat: 28.6448,
    stop_lon: 77.2167,
    isActive: true
  },
  {
    stop_id: "10",
    stop_name: "IGI Airport",
    stop_desc: "Indira Gandhi International Airport Metro",
    stop_lat: 28.5562,
    stop_lon: 77.1000,
    isActive: true
  }
];

// Get all routes
export const getGTFSRoutes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch custom routes from DB
    const dbRoutes = await RouteModel.find({ isActive: true });
    const convertedDbRoutes = dbRoutes.map(route => ({
      route_id: route._id.toString(),
      agency_id: "CUSTOM",
      route_short_name: (route as any).busNumber || "BUS",
      route_long_name: (route as any).routeName,
      route_desc: `Operated by Bus नियोजक`,
      route_type: 3, // Bus
      route_color: "4F46E5",
      route_text_color: "FFFFFF",
      isActive: (route as any).isActive
    }));

    let allRoutes = [...mockGTFSRoutes, ...convertedDbRoutes].filter(route => route.isActive);

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allRoutes = allRoutes.filter(route =>
        route.route_short_name.toLowerCase().includes(searchTerm) ||
        route.route_long_name.toLowerCase().includes(searchTerm)
      );
    }

    if (type) {
      const routeType = parseInt(type as string);
      allRoutes = allRoutes.filter(route => route.route_type === routeType);
    }

    const routes = allRoutes
      .sort((a, b) => a.route_short_name.localeCompare(b.route_short_name))
      .slice(skip, skip + Number(limit));

    const total = allRoutes.length;

    res.json({
      success: true,
      data: routes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching routes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get all stops
export const getGTFSStops = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, lat, lng, radius = 5 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Extract stops from persistent routes
    const dbRoutes = await RouteModel.find({ isActive: true });
    const dbStops = dbRoutes.flatMap(route =>
      route.stops.map(stop => ({
        stop_id: (stop as any)._id?.toString() || `stop_${Math.random()}`,
        stop_name: stop.name,
        stop_desc: route.routeName,
        stop_lat: stop.lat,
        stop_lon: stop.lng,
        isActive: true
      }))
    );

    let allStops = [...mockGTFSStops, ...dbStops].filter(stop => stop.isActive);

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allStops = allStops.filter(stop =>
        stop.stop_name.toLowerCase().includes(searchTerm) ||
        stop.stop_desc.toLowerCase().includes(searchTerm)
      );
    }

    let stops;
    let total;

    if (lat && lng) {
      // Simple distance calculation for nearby stops
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusNum = parseFloat(radius as string);

      const stopsWithDistance = allStops.map(stop => {
        const distance = Math.sqrt(
          Math.pow(stop.stop_lat - latNum, 2) + Math.pow(stop.stop_lon - lngNum, 2)
        ) * 111; // Rough conversion to km
        return { ...stop, distance };
      }).filter(stop => stop.distance <= radiusNum);

      stops = stopsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(skip, skip + Number(limit));

      total = stopsWithDistance.length;
    } else {
      stops = allStops
        .sort((a, b) => a.stop_name.localeCompare(b.stop_name))
        .slice(skip, skip + Number(limit));

      total = allStops.length;
    }

    res.json({
      success: true,
      data: stops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stops",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Search routes between stops
export const searchGTFSRoutes = async (req: Request, res: Response) => {
  try {
    const query = req.query as any;
    const { from, to, date, time } = query;

    if (!from || !to || (from as string).trim() === '' || (to as string).trim() === '') {
      // If no search terms provided, return all routes
      const allRoutesSorted = mockGTFSRoutes
        .filter(route => route.isActive)
        .sort((a, b) => a.route_short_name.localeCompare(b.route_short_name));

      return res.json({
        success: true,
        data: allRoutesSorted,
        searchParams: { from, to, date, time },
        fromStops: [],
        toStops: [],
        totalRoutes: allRoutesSorted.length,
        selectedCount: allRoutesSorted.length
      });
    }

    // Find stops that match the search terms
    const fromStops = mockGTFSStops.filter(stop =>
      stop.stop_name.toLowerCase().includes((from as string).toLowerCase()) ||
      stop.stop_desc.toLowerCase().includes((from as string).toLowerCase())
    );

    const toStops = mockGTFSStops.filter(stop =>
      stop.stop_name.toLowerCase().includes((to as string).toLowerCase()) ||
      stop.stop_desc.toLowerCase().includes((to as string).toLowerCase())
    );

    // Get all active routes
    const allRoutes = mockGTFSRoutes.filter(route => route.isActive);

    // Intelligent route filtering based on route characteristics
    const filteredRoutes = allRoutes
      .map(route => {
        // Calculate route relevance score based on various factors
        let score = 0;

        // Base score for route type (bus routes get higher priority)
        if (route.route_type === 1) score += 2;
        else if (route.route_type === 2) score += 1;
        else score += 0;

        // Check if route name contains destination keywords
        const routeName = route.route_long_name?.toLowerCase() || '';
        const fromLower = (from as string).toLowerCase();
        const toLower = (to as string).toLowerCase();

        // Direct route matches get highest priority
        if (routeName.includes(fromLower) && routeName.includes(toLower)) {
          score += 50; // Much higher score for exact matches
        } else if (routeName.includes(fromLower) || routeName.includes(toLower)) {
          score += 20; // Good score for partial matches
        } else {
          // Check for partial word matches
          const fromWords = fromLower.split(' ').filter(word => word.length > 2);
          const toWords = toLower.split(' ').filter(word => word.length > 2);

          let partialMatches = 0;
          fromWords.forEach(word => {
            if (routeName.includes(word)) partialMatches += 5;
          });
          toWords.forEach(word => {
            if (routeName.includes(word)) partialMatches += 5;
          });

          score += partialMatches;
        }

        // Shorter route names typically indicate more direct routes
        const nameLength = route.route_long_name?.length || 0;
        if (nameLength < 30) score += 5;
        else if (nameLength < 50) score += 3;
        else if (nameLength > 80) score -= 2;

        // Route number patterns (shorter numbers often indicate main routes)
        const routeNumber = route.route_short_name?.length || 0;
        if (routeNumber <= 3) score += 3;
        else if (routeNumber <= 5) score += 1;

        // Color-coded routes (main lines) get priority
        if (route.route_color && route.route_color !== '000000') {
          score += 2;
        }

        return { ...route, relevanceScore: score };
      })
      .filter(route => route.relevanceScore > 10) // Only return routes with meaningful relevance
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return all relevant routes sorted by relevance score
    // Remove duplicates and return all matching routes
    let uniqueRoutes = filteredRoutes
      .filter((route, index, self) =>
        index === self.findIndex(r => r.route_id === route.route_id)
      );

    // If no routes match the search criteria, return all routes sorted by relevance
    if (uniqueRoutes.length === 0) {
      uniqueRoutes = allRoutes
        .map(route => ({ ...route, relevanceScore: 1 }))
        .sort((a, b) => a.route_short_name.localeCompare(b.route_short_name));
    }

    res.json({
      success: true,
      data: uniqueRoutes,
      searchParams: { from, to, date, time },
      fromStops: fromStops.map(s => ({ id: s.stop_id, name: s.stop_name })),
      toStops: toStops.map(s => ({ id: s.stop_id, name: s.stop_name })),
      totalRoutes: allRoutes.length,
      selectedCount: uniqueRoutes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching routes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
