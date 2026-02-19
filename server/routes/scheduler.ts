import { RequestHandler } from "express";
import { BusSchedule } from "../../shared/types";

const schedules: BusSchedule[] = [
  {
    id: "sch_1",
    tripId: "TRIP-001",
    busNumber: "DL-01-AB-1234",
    routeId: "Route-101",
    departureTime: "06:00",
    arrivalTime: "08:30",
    dayOfWeek: 1, // Monday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-001",
      conductorId: "CON-001",
    },
    mode: "linked",
    restWindows: [
      { start: "12:00", end: "13:00" },
      { start: "18:00", end: "19:00" },
    ],
  },
  {
    id: "sch_2",
    tripId: "TRIP-002",
    busNumber: "DL-02-CD-5678",
    routeId: "Route-102",
    departureTime: "07:15",
    arrivalTime: "09:45",
    dayOfWeek: 2, // Tuesday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-002",
      conductorId: "CON-002",
    },
    mode: "unlinked",
    restWindows: [
      { start: "13:30", end: "14:30" },
    ],
  },
  {
    id: "sch_3",
    tripId: "TRIP-003",
    busNumber: "DL-03-EF-9012",
    routeId: "Route-103",
    departureTime: "08:30",
    arrivalTime: "11:00",
    dayOfWeek: 3, // Wednesday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-003",
      conductorId: "CON-003",
    },
    mode: "linked",
    restWindows: [
      { start: "14:00", end: "15:00" },
      { start: "20:00", end: "21:00" },
    ],
  },
  {
    id: "sch_4",
    tripId: "TRIP-004",
    busNumber: "DL-04-GH-3456",
    routeId: "Route-104",
    departureTime: "09:45",
    arrivalTime: "12:15",
    dayOfWeek: 4, // Thursday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-004",
      conductorId: "CON-004",
    },
    mode: "unlinked",
    restWindows: [
      { start: "15:30", end: "16:30" },
    ],
  },
  {
    id: "sch_5",
    tripId: "TRIP-005",
    busNumber: "DL-05-IJ-7890",
    routeId: "Route-105",
    departureTime: "11:00",
    arrivalTime: "13:30",
    dayOfWeek: 5, // Friday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-005",
      conductorId: "CON-005",
    },
    mode: "linked",
    restWindows: [
      { start: "17:00", end: "18:00" },
      { start: "22:00", end: "23:00" },
    ],
  },
  {
    id: "sch_6",
    tripId: "TRIP-006",
    busNumber: "DL-06-KL-2468",
    routeId: "Route-106",
    departureTime: "12:30",
    arrivalTime: "15:00",
    dayOfWeek: 6, // Saturday
    isWeekend: true,
    crewAssignments: {
      driverId: "DRV-006",
      conductorId: "CON-006",
    },
    mode: "unlinked",
    restWindows: [
      { start: "18:30", end: "19:30" },
    ],
  },
  {
    id: "sch_7",
    tripId: "TRIP-007",
    busNumber: "DL-07-MN-1357",
    routeId: "Route-107",
    departureTime: "14:00",
    arrivalTime: "16:30",
    dayOfWeek: 0, // Sunday
    isWeekend: true,
    crewAssignments: {
      driverId: "DRV-007",
      conductorId: "CON-007",
    },
    mode: "linked",
    restWindows: [
      { start: "20:00", end: "21:00" },
      { start: "23:30", end: "00:30" },
    ],
  },
  {
    id: "sch_8",
    tripId: "TRIP-008",
    busNumber: "DL-08-OP-9753",
    routeId: "Route-108",
    departureTime: "15:30",
    arrivalTime: "18:00",
    dayOfWeek: 1, // Monday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-008",
      conductorId: "CON-008",
    },
    mode: "unlinked",
    restWindows: [
      { start: "21:30", end: "22:30" },
    ],
  },
  {
    id: "sch_9",
    tripId: "TRIP-009",
    busNumber: "DL-09-QR-8642",
    routeId: "Route-109",
    departureTime: "17:00",
    arrivalTime: "19:30",
    dayOfWeek: 2, // Tuesday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-009",
      conductorId: "CON-009",
    },
    mode: "linked",
    restWindows: [
      { start: "23:00", end: "00:00" },
      { start: "02:00", end: "03:00" },
    ],
  },
  {
    id: "sch_10",
    tripId: "TRIP-010",
    busNumber: "DL-10-ST-6420",
    routeId: "Route-110",
    departureTime: "18:45",
    arrivalTime: "21:15",
    dayOfWeek: 3, // Wednesday
    isWeekend: false,
    crewAssignments: {
      driverId: "DRV-010",
      conductorId: "CON-010",
    },
    mode: "unlinked",
    restWindows: [
      { start: "00:30", end: "01:30" },
    ],
  },
];
const makeId = () => `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const listSchedules: RequestHandler = (_req, res) => res.json({ schedules, total: schedules.length });
export const getScheduleById: RequestHandler = (req, res) => {
  const s = schedules.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json(s);
};
export const createSchedule: RequestHandler = (req, res) => {
  const b = req.body as Partial<BusSchedule>;
  if (!b.tripId || !b.busNumber || !b.routeId || !b.departureTime || !b.arrivalTime || typeof b.dayOfWeek !== "number") {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const s: BusSchedule = {
    id: makeId(),
    tripId: b.tripId,
    busNumber: b.busNumber,
    routeId: b.routeId,
    departureTime: b.departureTime,
    arrivalTime: b.arrivalTime,
    dayOfWeek: b.dayOfWeek,
    isWeekend: b.dayOfWeek === 0 || b.dayOfWeek === 6,
    crewAssignments: b.crewAssignments || { driverId: "", conductorId: undefined },
    mode: b.mode || "linked",
    restWindows: b.restWindows || [],
  };
  schedules.push(s);
  res.status(201).json(s);
};
export const updateSchedule: RequestHandler = (req, res) => {
  const i = schedules.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  const u = { ...schedules[i], ...req.body } as BusSchedule;
  u.isWeekend = u.dayOfWeek === 0 || u.dayOfWeek === 6;
  schedules[i] = u;
  res.json(u);
};
export const deleteSchedule: RequestHandler = (req, res) => {
  const i = schedules.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  const [r] = schedules.splice(i, 1);
  res.json({ deleted: r.id });
};


