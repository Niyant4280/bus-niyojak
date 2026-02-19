import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BusSchedule } from "@shared/types";
import { Calendar, Clock, Filter, MapPin, Plus, Edit, Trash2, ArrowLeft, Download, Users } from "lucide-react";

export default function AdminScheduler() {
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");

  const [form, setForm] = useState<Partial<BusSchedule>>({
    tripId: "",
    busNumber: "",
    routeId: "",
    departureTime: "",
    arrivalTime: "",
    dayOfWeek: 1,
    mode: "linked",
    restWindows: [],
    crewAssignments: { driverId: "", conductorId: "" },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers: HeadersInit = useMemo(() => ({ "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) }), [adminToken]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedules", { headers });
      if (!res.ok) throw new Error(`Failed to load schedules (${res.status})`);
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (e: any) {
      setError(e.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ tripId: "", busNumber: "", routeId: "", departureTime: "", arrivalTime: "", dayOfWeek: 1, mode: "linked", restWindows: [], crewAssignments: { driverId: "", conductorId: "" } });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/schedules/${editingId}` : "/api/admin/schedules";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await fetchSchedules();
      resetForm();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s: BusSchedule) => {
    setEditingId(s.id);
    setForm({ tripId: s.tripId, busNumber: s.busNumber, routeId: s.routeId, departureTime: s.departureTime, arrivalTime: s.arrivalTime, dayOfWeek: s.dayOfWeek, mode: s.mode, restWindows: s.restWindows, crewAssignments: s.crewAssignments });
  };

  const handleDelete = async () => {
    if (!showDeleteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/schedules/${showDeleteId}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await fetchSchedules();
      setShowDeleteId(null);
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const filtered = schedules.filter((s) => {
    const matchesSearch = s.tripId.toLowerCase().includes(search.toLowerCase()) || s.busNumber.toLowerCase().includes(search.toLowerCase()) || s.routeId.toLowerCase().includes(search.toLowerCase());
    const matchesDay = dayFilter === "all" || String(s.dayOfWeek) === dayFilter;
    return matchesSearch && matchesDay;
  });

  const downloadPdf = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups for this site to download PDF');
        return;
      }

      const styles = `
        <style>
          @media print {
            @page { 
              size: A4 portrait; 
              margin: 15mm; 
            }
            body { margin: 0; }
          }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #111827; 
            margin: 20px;
            line-height: 1.4;
          }
          h1 { 
            font-size: 24px; 
            margin: 0 0 16px; 
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .meta { 
            font-size: 14px; 
            color: #6b7280; 
            margin-bottom: 20px; 
            background: #f9fafb;
            padding: 8px 12px;
            border-radius: 6px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 13px; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #d1d5db; 
            padding: 10px 12px; 
            vertical-align: top; 
            text-align: left;
          }
          th { 
            background: #f3f4f6; 
            font-weight: 600;
            color: #374151;
          }
          tr:nth-child(even) { background: #f9fafb; }
          .chip { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 12px; 
            background: #dbeafe; 
            color: #1e40af; 
            font-size: 11px; 
            font-weight: 500;
          }
          .trip-id { font-weight: 600; color: #1f2937; }
          .trip-uuid { font-size: 10px; color: #9ca3af; }
        </style>
      `;

      const rows = filtered.map((s) => `
        <tr>
          <td>
            <div class="trip-id">${s.tripId}</div>
            <div class="trip-uuid">${s.id}</div>
          </td>
          <td><strong>${s.busNumber}</strong></td>
          <td>${s.routeId}</td>
          <td>${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.dayOfWeek]}</td>
          <td><span class="chip">${s.mode || "linked"}</span></td>
          <td><strong>${s.departureTime}</strong> → <strong>${s.arrivalTime}</strong></td>
          <td>
            <div><strong>Driver:</strong> ${s.crewAssignments?.driverId || "-"}</div>
            ${s.crewAssignments?.conductorId ? `<div><strong>Conductor:</strong> ${s.crewAssignments.conductorId}</div>` : ""}
          </td>
        </tr>
      `).join("");

      const today = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bus Schedules Report</title>
          ${styles}
        </head>
        <body>
          <h1>🚌 Bus Schedules Report</h1>
          <div class="meta">
            <strong>Generated:</strong> ${today} | 
            <strong>Total Schedules:</strong> ${filtered.length} | 
            <strong>Filter:</strong> ${dayFilter === "all" ? "All Days" : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][parseInt(dayFilter)]}
          </div>
          <table>
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Bus Number</th>
                <th>Route ID</th>
                <th>Day</th>
                <th>Mode</th>
                <th>Timing</th>
                <th>Crew Assignment</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close window after printing dialog
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bus Scheduler</h1>
              <p className="text-gray-600 mt-1">Linked/unlinked duty, rest windows and crew assignments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button onClick={resetForm} variant="secondary">
              <Plus className="h-4 w-4 mr-2" /> New Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <Input placeholder="Trip, bus or route" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Day</label>
                    <Select value={dayFilter} onValueChange={setDayFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {["0","1","2","3","4","5","6"].map((d) => (
                          <SelectItem key={d} value={d}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][Number(d)]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedules ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                    <p className="text-gray-600">Create your first schedule using the form</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table className="min-w-[1100px] text-sm">
                      <TableHeader>
                        <TableRow className="border-b">
                          <TableHead className="py-3 px-3">Trip</TableHead>
                          <TableHead className="py-3 px-3">Bus</TableHead>
                          <TableHead className="py-3 px-3">Route</TableHead>
                          <TableHead className="py-3 px-3">Day</TableHead>
                          <TableHead className="py-3 px-3">Mode</TableHead>
                          <TableHead className="py-3 px-3">Timing</TableHead>
                          <TableHead className="py-3 px-3">Crew</TableHead>
                          <TableHead className="py-3 px-3">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((s) => (
                          <TableRow key={s.id} className="align-top">
                            <TableCell className="py-3 px-3 align-top">
                              <div className="space-y-0.5">
                                <div className="font-medium text-gray-900 break-all">{s.tripId}</div>
                                <div className="text-[11px] text-gray-500 break-all">{s.id}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="space-y-0.5">
                                <div className="font-medium text-gray-900 break-words">{s.busNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="flex items-center gap-1 text-sm break-words"><MapPin className="h-3 w-3" />{s.routeId}</div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <Badge className={s.isWeekend ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.dayOfWeek]}</Badge>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <Badge className={s.mode === "linked" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{s.mode}</Badge>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="flex items-center gap-2 text-sm"><Clock className="h-3 w-3" />{s.departureTime} → {s.arrivalTime}</div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="flex flex-col gap-1 text-sm">
                                <div className="flex items-center gap-2"><Users className="h-3 w-3" />Driver: {s.crewAssignments.driverId || "-"}</div>
                                {s.crewAssignments.conductorId && <div className="pl-5 text-gray-700">Conductor: {s.crewAssignments.conductorId}</div>}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit className="h-4 w-4" /></Button>
                                <Dialog open={showDeleteId === s.id} onOpenChange={(open) => setShowDeleteId(open ? s.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Schedule</DialogTitle>
                                      <DialogDescription>Delete schedule for trip {s.tripId}?</DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                                      <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Schedule" : "New Schedule"}</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (<div className="text-sm text-red-600 mb-3">{error}</div>)}
                <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Trip ID</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.tripId || ""} onChange={(e) => setForm((f) => ({ ...f, tripId: e.target.value }))} required /></div>
                  <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Bus Number</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.busNumber || ""} onChange={(e) => setForm((f) => ({ ...f, busNumber: e.target.value }))} required /></div>
                  <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Route ID</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.routeId || ""} onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))} required /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Departure</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" type="time" value={form.departureTime || ""} onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))} required /></div>
                    <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Arrival</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" type="time" value={form.arrivalTime || ""} onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))} required /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Day of Week</label>
                    <Select value={String(form.dayOfWeek ?? 1)} onValueChange={(v) => setForm((f) => ({ ...f, dayOfWeek: Number(v) }))}>
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10"><SelectValue placeholder="Select day" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <SelectItem value={String(i)} key={i}>{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][i]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Mode</label>
                    <Select value={String(form.mode || "linked")} onValueChange={(v) => setForm((f) => ({ ...f, mode: v as any }))}>
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10"><SelectValue placeholder="Select mode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linked">Linked</SelectItem>
                        <SelectItem value="unlinked">Unlinked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Driver ID</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.crewAssignments?.driverId || ""} onChange={(e) => setForm((f) => ({ ...f, crewAssignments: { ...(f.crewAssignments || { driverId: "", conductorId: "" }), driverId: e.target.value } }))} /></div>
                    <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Conductor ID</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.crewAssignments?.conductorId || ""} onChange={(e) => setForm((f) => ({ ...f, crewAssignments: { ...(f.crewAssignments || { driverId: "", conductorId: "" }), conductorId: e.target.value } }))} /></div>
                  </div>
                  <div className="flex gap-2 pt-1"><Button type="submit" disabled={loading}>{editingId ? "Save" : "Create"}</Button>{editingId && (<Button type="button" variant="outline" onClick={resetForm} disabled={loading}>Cancel</Button>)}</div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


