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
import { CrewMember } from "@shared/types";
import { Users, Filter, Plus, Edit, Trash2, ArrowLeft, Download, Phone, Mail, Shield, Bus } from "lucide-react";

export default function AdminCrew() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState<Partial<CrewMember>>({ name: "", role: "driver", phone: "", email: "", licenseNumber: "", shiftStart: "06:00", shiftEnd: "14:00", assignedBus: "", isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers: HeadersInit = useMemo(() => ({ "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) }), [adminToken]);

  const fetchCrew = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/crew", { headers });
      if (!res.ok) throw new Error(`Failed to load crew (${res.status})`);
      const data = await res.json();
      setCrew(data.crew || []);
    } catch (e: any) {
      setError(e.message || "Failed to load crew");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCrew(); /* eslint-disable-next-line */ }, []);

  const resetForm = () => { setForm({ name: "", role: "driver", phone: "", email: "", licenseNumber: "", shiftStart: "06:00", shiftEnd: "14:00", assignedBus: "", isActive: true }); setEditingId(null); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const method = editingId ? "PUT" : "POST"; const url = editingId ? `/api/admin/crew/${editingId}` : "/api/admin/crew";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) }); if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await fetchCrew(); resetForm();
    } catch (e: any) { setError(e.message || "Failed to save"); } finally { setLoading(false); }
  };
  const handleEdit = (m: CrewMember) => { setEditingId(m.id); setForm(m); };
  const handleDelete = async () => { if (!showDeleteId) return; setLoading(true); setError(null); try { const res = await fetch(`/api/admin/crew/${showDeleteId}`, { method: "DELETE", headers }); if (!res.ok) throw new Error(`Delete failed (${res.status})`); await fetchCrew(); setShowDeleteId(null); } catch (e: any) { setError(e.message || "Failed to delete"); } finally { setLoading(false); } };

  const filtered = crew.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || (c.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || c.role === (roleFilter as any);
    const matchesStatus = statusFilter === "all" || String(c.isActive) === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
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
            font-size: 11px; 
            font-weight: 500;
          }
          .role-driver { background: #dbeafe; color: #1e40af; }
          .role-conductor { background: #e9d5ff; color: #7c3aed; }
          .status-active { background: #dcfce7; color: #166534; }
          .status-inactive { background: #f3f4f6; color: #6b7280; }
          .crew-name { font-weight: 600; color: #1f2937; }
          .license { font-size: 10px; color: #9ca3af; }
        </style>
      `;

      const rows = filtered.map((c) => `
        <tr>
          <td>
            <div class="crew-name">${c.name}</div>
            ${c.licenseNumber ? `<div class="license">License: ${c.licenseNumber}</div>` : ""}
          </td>
          <td>
            <div><strong>Phone:</strong> ${c.phone}</div>
            ${c.email ? `<div><strong>Email:</strong> ${c.email}</div>` : ""}
          </td>
          <td><span class="chip role-${c.role}">${c.role}</span></td>
          <td><span class="chip status-${c.isActive ? 'active' : 'inactive'}">${c.isActive ? "Active" : "Inactive"}</span></td>
          <td><strong>${c.shiftStart}</strong> - <strong>${c.shiftEnd}</strong></td>
          <td>${c.assignedBus || "-"}</td>
        </tr>
      `).join("");

      const today = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
      const roleText = roleFilter === "all" ? "All Roles" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1);
      const statusText = statusFilter === "all" ? "All Status" : statusFilter === "true" ? "Active Only" : "Inactive Only";
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Crew Management Report</title>
          ${styles}
        </head>
        <body>
          <h1>👥 Crew Management Report</h1>
          <div class="meta">
            <strong>Generated:</strong> ${today} | 
            <strong>Total Crew:</strong> ${filtered.length} | 
            <strong>Role Filter:</strong> ${roleText} | 
            <strong>Status Filter:</strong> ${statusText}
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Shift Hours</th>
                <th>Assigned Bus</th>
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
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild><Link to="/admin"><ArrowLeft className="h-4 w-4 mr-2"/>Back</Link></Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crew Management</h1>
              <p className="text-gray-600">Manage drivers and conductors, shifts and assignments</p>
            </div>
          </div>
          <div className="flex gap-2"><Button variant="outline" onClick={downloadPdf}><Download className="h-4 w-4 mr-2"/>Download PDF</Button><Button onClick={resetForm} variant="secondary"><Plus className="h-4 w-4 mr-2"/>New Crew</Button></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6"><CardHeader><CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2"/>Filters</CardTitle></CardHeader><CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-700">Search</label><Input placeholder="Name, phone or email" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-700">Role</label><Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="driver">Driver</SelectItem><SelectItem value="conductor">Conductor</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><label className="text-sm font-medium text-gray-700">Status</label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select></div>
              </div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Crew ({filtered.length})</CardTitle></CardHeader><CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-12"><Users className="h-12 w-12 text-gray-400 mx-auto mb-4"/><h3 className="text-lg font-medium text-gray-900 mb-2">No crew found</h3><p className="text-gray-600">Add your first crew member using the form</p></div>
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table className="min-w-[1000px] text-sm"><TableHeader><TableRow className="border-b"><TableHead className="py-3 px-3">Name</TableHead><TableHead className="py-3 px-3">Contact</TableHead><TableHead className="py-3 px-3">Role</TableHead><TableHead className="py-3 px-3">Status</TableHead><TableHead className="py-3 px-3">Shift</TableHead><TableHead className="py-3 px-3">Assigned Bus</TableHead><TableHead className="py-3 px-3">Actions</TableHead></TableRow></TableHeader><TableBody>
                    {filtered.map((m) => (
                      <TableRow key={m.id} className="align-top">
                        <TableCell className="py-3 px-3 align-top"><div className="font-medium text-gray-900 break-words">{m.name}</div>{m.licenseNumber && <div className="text-xs text-gray-500">License: {m.licenseNumber}</div>}</TableCell>
                        <TableCell className="py-3 px-3 align-top"><div className="text-sm flex items-center gap-2 break-all"><Phone className="h-3 w-3" />{m.phone}</div>{m.email && (<div className="text-xs text-gray-500 flex items-center gap-2 break-all"><Mail className="h-3 w-3" />{m.email}</div>)}</TableCell>
                        <TableCell className="py-3 px-3 align-top"><Badge className={m.role === "driver" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>{m.role}</Badge></TableCell>
                        <TableCell className="py-3 px-3 align-top"><Badge className={m.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{m.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="py-3 px-3 align-top"><div className="text-sm">{m.shiftStart} - {m.shiftEnd}</div></TableCell>
                        <TableCell className="py-3 px-3 align-top"><div className="text-sm break-words">{m.assignedBus || "-"}</div></TableCell>
                        <TableCell className="py-3 px-3 align-top">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}><Edit className="h-4 w-4"/></Button>
                            <Dialog open={showDeleteId === m.id} onOpenChange={(open) => setShowDeleteId(open ? m.id : null)}>
                              <DialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4"/></Button></DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Delete Crew</DialogTitle><DialogDescription>Delete {m.name}?</DialogDescription></DialogHeader>
                                <DialogFooter><Button variant="outline" onClick={() => setShowDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button></DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody></Table>
                </div>
              )}
            </CardContent></Card>
          </div>

          <div className="lg:col-span-1">
            <Card><CardHeader><CardTitle>{editingId ? "Edit Crew" : "New Crew"}</CardTitle></CardHeader><CardContent>
              {error && (<div className="text-sm text-red-600 mb-3">{error}</div>)}
              <form className="space-y-3 sm:space-y-4" onSubmit={submit}>
                <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Name</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Role</label><Select value={String(form.role || "driver")} onValueChange={(v) => setForm((f) => ({ ...f, role: v as any }))}><SelectTrigger className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10"><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="driver">Driver</SelectItem><SelectItem value="conductor">Conductor</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Phone</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Email</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" type="email" value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-gray-700">License Number</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.licenseNumber || ""} onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><label className="text-sm font-medium text-gray-700">Shift Start</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" type="time" value={form.shiftStart || "06:00"} onChange={(e) => setForm((f) => ({ ...f, shiftStart: e.target.value }))} /></div><div className="space-y-1"><label className="text-sm font-medium text-gray-700">Shift End</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" type="time" value={form.shiftEnd || "14:00"} onChange={(e) => setForm((f) => ({ ...f, shiftEnd: e.target.value }))} /></div></div>
                <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Assigned Bus</label><Input className="bg-white border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md h-10" value={form.assignedBus || ""} onChange={(e) => setForm((f) => ({ ...f, assignedBus: e.target.value }))} placeholder="e.g. GL-101" /></div>
                <div className="flex gap-2 pt-1"><Button type="submit" disabled={loading}>{editingId ? "Save" : "Create"}</Button>{editingId && (<Button type="button" variant="outline" onClick={resetForm} disabled={loading}>Cancel</Button>)}</div>
              </form>
            </CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}


