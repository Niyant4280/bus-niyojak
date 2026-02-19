import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, UserCheck, Bus, Route as RouteIcon, Settings } from "lucide-react";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage scheduling, crew, buses, and routes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3 sm:mb-4">Create and manage trips with linked/unlinked duties</p>
              <Button asChild><Link to="/admin/scheduler"><Clock className="h-4 w-4 mr-2"/>Open Scheduler</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crew</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3 sm:mb-4">Manage drivers and conductors, shifts and rest</p>
              <Button asChild variant="secondary"><Link to="/admin/crew"><UserCheck className="h-4 w-4 mr-2"/>Manage Crew</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Buses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3 sm:mb-4">Manage bus fleet, maintenance and specifications</p>
              <Button asChild variant="secondary"><Link to="/admin/buses"><Bus className="h-4 w-4 mr-2"/>Manage Buses</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Route Planner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3 sm:mb-4">Plan routes and analyze overlaps</p>
              <Button asChild variant="outline"><Link to="/admin/route-planner"><RouteIcon className="h-4 w-4 mr-2"/>Open Planner</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


