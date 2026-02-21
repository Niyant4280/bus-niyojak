import { RequestHandler } from "express";
import { CrewMember } from "../../shared/types.js";

const crew: CrewMember[] = [
  {
    id: "crew_1",
    name: "Rajesh Kumar",
    role: "driver",
    licenseNumber: "DL-1234567890",
    phone: "+91-9876543210",
    email: "rajesh.kumar@busniyojak.com",
    shiftStart: "06:00",
    shiftEnd: "14:00",
    assignedBus: "DL-01-AB-1234",
    isActive: true,
  },
  {
    id: "crew_2",
    name: "Priya Sharma",
    role: "conductor",
    phone: "+91-9876543211",
    email: "priya.sharma@busniyojak.com",
    shiftStart: "06:00",
    shiftEnd: "14:00",
    assignedBus: "DL-01-AB-1234",
    isActive: true,
  },
  {
    id: "crew_3",
    name: "Amit Singh",
    role: "driver",
    licenseNumber: "DL-1234567891",
    phone: "+91-9876543212",
    email: "amit.singh@busniyojak.com",
    shiftStart: "07:00",
    shiftEnd: "15:00",
    assignedBus: "DL-02-CD-5678",
    isActive: true,
  },
  {
    id: "crew_4",
    name: "Sunita Devi",
    role: "conductor",
    phone: "+91-9876543213",
    email: "sunita.devi@busniyojak.com",
    shiftStart: "07:00",
    shiftEnd: "15:00",
    assignedBus: "DL-02-CD-5678",
    isActive: true,
  },
  {
    id: "crew_5",
    name: "Vikram Patel",
    role: "driver",
    licenseNumber: "DL-1234567892",
    phone: "+91-9876543214",
    email: "vikram.patel@busniyojak.com",
    shiftStart: "08:00",
    shiftEnd: "16:00",
    assignedBus: "DL-03-EF-9012",
    isActive: true,
  },
  {
    id: "crew_6",
    name: "Meera Joshi",
    role: "conductor",
    phone: "+91-9876543215",
    email: "meera.joshi@busniyojak.com",
    shiftStart: "08:00",
    shiftEnd: "16:00",
    assignedBus: "DL-03-EF-9012",
    isActive: true,
  },
  {
    id: "crew_7",
    name: "Suresh Gupta",
    role: "driver",
    licenseNumber: "DL-1234567893",
    phone: "+91-9876543216",
    email: "suresh.gupta@busniyojak.com",
    shiftStart: "09:00",
    shiftEnd: "17:00",
    assignedBus: "DL-04-GH-3456",
    isActive: true,
  },
  {
    id: "crew_8",
    name: "Kavita Reddy",
    role: "conductor",
    phone: "+91-9876543217",
    email: "kavita.reddy@busniyojak.com",
    shiftStart: "09:00",
    shiftEnd: "17:00",
    assignedBus: "DL-04-GH-3456",
    isActive: true,
  },
  {
    id: "crew_9",
    name: "Ravi Verma",
    role: "driver",
    licenseNumber: "DL-1234567894",
    phone: "+91-9876543218",
    email: "ravi.verma@busniyojak.com",
    shiftStart: "10:00",
    shiftEnd: "18:00",
    assignedBus: "DL-05-IJ-7890",
    isActive: true,
  },
  {
    id: "crew_10",
    name: "Anita Malhotra",
    role: "conductor",
    phone: "+91-9876543219",
    email: "anita.malhotra@busniyojak.com",
    shiftStart: "10:00",
    shiftEnd: "18:00",
    assignedBus: "DL-05-IJ-7890",
    isActive: true,
  },
];
const makeId = () => `crew_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const listCrew: RequestHandler = (_req, res) => res.json({ crew, total: crew.length });
export const getCrewById: RequestHandler = (req, res) => {
  const m = crew.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "Not found" });
  res.json(m);
};
export const createCrew: RequestHandler = (req, res) => {
  const b = req.body as Partial<CrewMember>;
  if (!b.name || !b.role || !b.phone) return res.status(400).json({ error: "Missing required fields" });
  const m: CrewMember = {
    id: makeId(),
    name: b.name,
    role: b.role,
    licenseNumber: b.licenseNumber,
    phone: b.phone,
    email: b.email || "",
    shiftStart: b.shiftStart || "06:00",
    shiftEnd: b.shiftEnd || "14:00",
    assignedBus: b.assignedBus,
    isActive: b.isActive ?? true,
  };
  crew.push(m);
  res.status(201).json(m);
};
export const updateCrew: RequestHandler = (req, res) => {
  const i = crew.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  const u = { ...crew[i], ...req.body } as CrewMember;
  crew[i] = u;
  res.json(u);
};
export const deleteCrew: RequestHandler = (req, res) => {
  const i = crew.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  const [r] = crew.splice(i, 1);
  res.json({ deleted: r.id });
};


