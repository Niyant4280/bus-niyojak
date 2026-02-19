import { MapPin, Navigation, Clock } from "lucide-react";

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface RouteMapProps {
  stops: Stop[];
  busPosition?: { lat: number; lng: number };
  className?: string;
}

export default function RouteMap({
  stops,
  busPosition,
  className = "",
}: RouteMapProps) {
  if (stops.length === 0) {
    return (
      <div
        className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border-2 border-dashed border-muted`}
      >
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold mb-2">No Route Selected</h3>
          <p className="text-muted-foreground">
            Select a bus route to see it on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className} bg-gradient-to-br from-background to-muted/10 h-full`}
    >
      {/* Status Bar */}
      {busPosition && (
        <div className="absolute top-2 right-2 z-20 flex items-center space-x-2 bg-accent/90 px-3 py-1 rounded-full shadow-lg">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Bus Active</span>
        </div>
      )}

      {/* Route Display */}
      <div className="p-4 h-full overflow-y-auto">
        <div className="relative">
          {/* Route Line */}
          <div className="absolute left-6 top-6 bottom-6 w-1 bg-gradient-to-b from-green-500 via-primary to-red-500 rounded-full"></div>

          {/* Stops */}
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="relative flex items-start space-x-4"
              >
                {/* Stop Marker */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                      index === 0
                        ? "bg-green-500"
                        : index === stops.length - 1
                          ? "bg-red-500"
                          : "bg-primary"
                    }`}
                  >
                    {index === 0 ? (
                      <span className="text-white font-bold text-sm">S</span>
                    ) : index === stops.length - 1 ? (
                      <span className="text-white font-bold text-sm">E</span>
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Bus Position Indicator */}
                  {busPosition && index === 1 && (
                    <div className="absolute -right-2 -top-2 bg-accent text-accent-foreground rounded-lg px-2 py-1 text-xs font-bold shadow-lg animate-bounce">
                      🚌
                    </div>
                  )}
                </div>

                {/* Stop Information */}
                <div className="flex-1 bg-white rounded-lg p-3 shadow-sm border border-border">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {stop.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1 text-xs text-foreground font-medium">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-primary">{index * 8 + 5}m</span>
                    </div>
                    {index === 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        Start
                      </span>
                    )}
                    {index === stops.length - 1 && (
                      <span className="text-xs text-red-500 font-medium">
                        End
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Summary */}
        <div className="mt-4 bg-muted/30 rounded-lg p-3 border border-border">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-primary">
                {stops.length}
              </div>
              <div className="text-xs text-muted-foreground">Stops</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                ~{stops.length * 8}m
              </div>
              <div className="text-xs text-foreground font-medium">Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {((stops.length - 1) * 2.5).toFixed(1)}km
              </div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">●</div>
              <div className="text-xs text-muted-foreground">Live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
