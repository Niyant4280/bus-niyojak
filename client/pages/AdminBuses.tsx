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
import { Bus } from "@shared/types";
import { ArrowLeft, Bus as BusIcon, Filter, Plus, Edit, Trash2, Download, Wrench, Calendar, Fuel, Users } from "lucide-react";

export default function AdminBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [acFilter, setAcFilter] = useState<string>("all");
  const [form, setForm] = useState<Partial<Bus>>({
    busId: "",
    busNumber: "",
    busType: "Standard",
    acType: "AC",
    avgMileage: 0,
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    busStatus: "Active",
      capacity: 50,
    fuelType: "CNG",
    registrationDate: "",
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    assignedRoute: "",
    driverId: "",
    conductorId: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers: HeadersInit = useMemo(() => ({ "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) }), [adminToken]);

  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/buses", { headers });
      if (!res.ok) throw new Error(`Failed to load buses (${res.status})`);
      const data = await res.json();
      setBuses(data.buses || []);
    } catch (e: any) {
      setError(e.message || "Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({
      busId: "",
      busNumber: "",
      busType: "Standard",
      acType: "AC",
      avgMileage: 0,
      lastMaintenanceDate: "",
      nextMaintenanceDate: "",
      busStatus: "Active",
      capacity: 50,
      fuelType: "CNG",
      registrationDate: "",
      manufacturer: "",
      model: "",
      year: new Date().getFullYear(),
      assignedRoute: "",
      driverId: "",
      conductorId: ""
    });
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/buses/${editingId}` : "/api/admin/buses";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await fetchBuses();
      resetForm();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bus: Bus) => {
    setEditingId(bus.id);
    setForm(bus);
  };

  const handleDelete = async () => {
    if (!showDeleteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/buses/${showDeleteId}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await fetchBuses();
      setShowDeleteId(null);
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const filtered = buses.filter((b) => {
    const matchesSearch = b.busId.toLowerCase().includes(search.toLowerCase()) || 
                         b.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                         b.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
                         b.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.busStatus === statusFilter;
    const matchesAc = acFilter === "all" || b.acType === acFilter;
    return matchesSearch && matchesStatus && matchesAc;
  });

  const downloadPdf = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups for this site to download PDF');
        return;
      }

      const styles = `
        <style>
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body { margin: 0; }
          }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #111827; margin: 20px; line-height: 1.4;
          }
          h1 { font-size: 24px; margin: 0 0 16px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
          .meta { font-size: 14px; color: #6b7280; margin-bottom: 20px; background: #f9fafb; padding: 8px 12px; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
          th, td { border: 1px solid #d1d5db; padding: 10px 12px; vertical-align: top; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; color: #374151; }
          tr:nth-child(even) { background: #f9fafb; }
          .chip { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
          .status-active { background: #dcfce7; color: #166534; }
          .status-maintenance { background: #fef3c7; color: #92400e; }
          .status-retired { background: #f3f4f6; color: #6b7280; }
          .ac-ac { background: #dbeafe; color: #1e40af; }
          .ac-non-ac { background: #e5e7eb; color: #374151; }
        </style>
      `;

      const rows = filtered.map((b) => `
        <tr>
          <td><div><strong>${b.busId}</strong></div><div style="font-size:10px;color:#9ca3af;">${b.busNumber}</div></td>
          <td>${b.manufacturer} ${b.model}</td>
          <td><span class="chip ac-${b.acType.toLowerCase().replace('-', '-')}">${b.acType}</span></td>
          <td>${b.avgMileage} km/L</td>
          <td>${b.lastMaintenanceDate || "-"}</td>
          <td>${b.nextMaintenanceDate || "-"}</td>
          <td><span class="chip status-${b.busStatus.toLowerCase().replace(' ', '-')}">${b.busStatus}</span></td>
          <td>${b.capacity} seats</td>
          <td>${b.fuelType}</td>
        </tr>
      `).join("");

      const today = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Buses Management Report</title>
          ${styles}
        </head>
        <body>
          <h1>🚌 Buses Management Report</h1>
          <div class="meta">
            <strong>Generated:</strong> ${today} | 
            <strong>Total Buses:</strong> ${filtered.length} | 
            <strong>Status Filter:</strong> ${statusFilter === "all" ? "All Status" : statusFilter} | 
            <strong>AC Filter:</strong> ${acFilter === "all" ? "All Types" : acFilter}
          </div>
          <table>
            <thead>
              <tr>
                <th>Bus ID</th>
                <th>Model</th>
                <th>AC Type</th>
                <th>Mileage</th>
                <th>Last Maintenance</th>
                <th>Next Maintenance</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Fuel Type</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
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
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2"/>Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buses Management</h1>
              <p className="text-gray-600">Manage bus fleet, maintenance schedules and specifications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button onClick={resetForm} variant="secondary">
              <Plus className="h-4 w-4 mr-2" /> New Bus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2"/>Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Search</label>
                  <Input
                      placeholder="Bus ID, number, manufacturer or model" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                  />
                </div>
                  <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">AC Type</label>
                    <Select value={acFilter} onValueChange={setAcFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
                <CardTitle>Buses ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
                {filtered.length === 0 ? (
              <div className="text-center py-12">
                    <BusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
                    <p className="text-gray-600">Add your first bus using the form</p>
              </div>
            ) : (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table className="min-w-[1200px] text-sm">
                  <TableHeader>
                        <TableRow className="border-b">
                          <TableHead className="py-3 px-3">Bus ID</TableHead>
                          <TableHead className="py-3 px-3">Model</TableHead>
                          <TableHead className="py-3 px-3">AC Type</TableHead>
                          <TableHead className="py-3 px-3">Mileage</TableHead>
                          <TableHead className="py-3 px-3">Last Maintenance</TableHead>
                          <TableHead className="py-3 px-3">Next Maintenance</TableHead>
                          <TableHead className="py-3 px-3">Status</TableHead>
                          <TableHead className="py-3 px-3">Capacity</TableHead>
                          <TableHead className="py-3 px-3">Fuel</TableHead>
                          <TableHead className="py-3 px-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                        {filtered.map((bus) => (
                          <TableRow key={bus.id} className="align-top">
                            <TableCell className="py-3 px-3 align-top">
                              <div className="font-medium text-gray-900 break-words">{bus.busId}</div>
                              <div className="text-xs text-gray-500">{bus.busNumber}</div>
                        </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="text-sm">{bus.manufacturer} {bus.model}</div>
                              <div className="text-xs text-gray-500">{bus.year}</div>
                        </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <Badge className={bus.acType === "AC" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                {bus.acType}
                          </Badge>
                        </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="text-sm">{bus.avgMileage} km/L</div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="text-sm">{bus.lastMaintenanceDate || "-"}</div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="text-sm">{bus.nextMaintenanceDate || "-"}</div>
                            </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <Badge className={
                                bus.busStatus === "Active" ? "bg-green-100 text-green-800" :
                                bus.busStatus === "In Maintenance" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {bus.busStatus}
                            </Badge>
                        </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="text-sm">{bus.capacity} seats</div>
                        </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                              <div className="text-sm">{bus.fuelType}</div>
                        </TableCell>
                            <TableCell className="py-3 px-3 align-top">
                          <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(bus)}>
                                  <Edit className="h-4 w-4"/>
                            </Button>
                                <Dialog open={showDeleteId === bus.id} onOpenChange={(open) => setShowDeleteId(open ? bus.id : null)}>
                                  <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4"/>
                            </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Bus</DialogTitle>
                                      <DialogDescription>Delete {bus.busId} ({bus.busNumber})?</DialogDescription>
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
                <CardTitle>{editingId ? "Edit Bus" : "New Bus"}</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-sm text-red-600 mb-3">{error}</div>
                )}
                <form className="space-y-3 sm:space-y-4" onSubmit={submit}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Bus ID</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      value={form.busId || ""} 
                      onChange={(e) => setForm((f) => ({ ...f, busId: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Bus Number</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      value={form.busNumber || ""} 
                      onChange={(e) => setForm((f) => ({ ...f, busNumber: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Bus Type</label>
                    <Select value={form.busType || "Standard"} onValueChange={(v) => setForm((f) => ({ ...f, busType: v }))}>
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Mini">Mini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">AC Type</label>
                    <Select value={form.acType || "AC"} onValueChange={(v) => setForm((f) => ({ ...f, acType: v as "AC" | "Non-AC" }))}>
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10">
                        <SelectValue placeholder="Select AC type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Manufacturer</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      value={form.manufacturer || ""} 
                      onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Model</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      value={form.model || ""} 
                      onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      type="number" 
                      value={form.year || new Date().getFullYear()} 
                      onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) }))} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Capacity</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      type="number" 
                      value={form.capacity || 50} 
                      onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) }))} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Fuel Type</label>
                    <Select value={form.fuelType || "CNG"} onValueChange={(v) => setForm((f) => ({ ...f, fuelType: v as "Diesel" | "CNG" | "Electric" }))}>
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="CNG">CNG</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Average Mileage (km/L)</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      type="number" 
                      step="0.1" 
                      value={form.avgMileage || 0} 
                      onChange={(e) => setForm((f) => ({ ...f, avgMileage: parseFloat(e.target.value) }))} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Bus Status</label>
                    <Select value={form.busStatus || "Active"} onValueChange={(v) => setForm((f) => ({ ...f, busStatus: v as "Active" | "In Maintenance" | "Retired" }))}>
                      <SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Last Maintenance</label>
                      <Input 
                        className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                        type="date" 
                        value={form.lastMaintenanceDate || ""} 
                        onChange={(e) => setForm((f) => ({ ...f, lastMaintenanceDate: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Next Maintenance</label>
                      <Input 
                        className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                        type="date" 
                        value={form.nextMaintenanceDate || ""} 
                        onChange={(e) => setForm((f) => ({ ...f, nextMaintenanceDate: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Registration Date</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      type="date" 
                      value={form.registrationDate || ""} 
                      onChange={(e) => setForm((f) => ({ ...f, registrationDate: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Assigned Route</label>
                    <Input 
                      className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                      value={form.assignedRoute || ""} 
                      onChange={(e) => setForm((f) => ({ ...f, assignedRoute: e.target.value }))} 
                      placeholder="e.g. Route-101" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Driver ID</label>
                      <Input 
                        className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                        value={form.driverId || ""} 
                        onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))} 
                        placeholder="e.g. DRV-001" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Conductor ID</label>
                      <Input 
                        className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" 
                        value={form.conductorId || ""} 
                        onChange={(e) => setForm((f) => ({ ...f, conductorId: e.target.value }))} 
                        placeholder="e.g. CON-001" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" disabled={loading}>
                      {editingId ? "Save" : "Create"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}