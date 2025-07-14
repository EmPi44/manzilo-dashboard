"use client";

import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { communities } from "../data/dummyData";
import Map from "../components/Map";
import { MetricCard } from "../components/MetricCard";
import type { ReactNode } from "react";

// Types
interface Building {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  metrics: {
    ticketsOpen: number;
    ticketsClosed: number;
    timeSaved: number;
    ticketsSolved: number;
    tenants: number;
  };
}
interface Metric {
  type: string;
  value: string | number;
  label: string;
}

function getMetrics(buildings: Building[]): Metric[] {
  // Aggregate metrics for all buildings
  const metrics = {
    ticketsOpen: 0,
    ticketsClosed: 0,
    timeSaved: 0,
    ticketsSolved: 0,
    tenants: 0,
  };
  buildings.forEach((b) => {
    metrics.ticketsOpen += b.metrics.ticketsOpen;
    metrics.ticketsClosed += b.metrics.ticketsClosed;
    metrics.timeSaved += b.metrics.timeSaved;
    metrics.ticketsSolved += b.metrics.ticketsSolved;
    metrics.tenants += b.metrics.tenants;
  });
  return [
    { type: "open", value: metrics.ticketsOpen, label: "Tickets Open" },
    { type: "closed", value: metrics.ticketsClosed, label: "Tickets Closed" },
    { type: "time", value: metrics.timeSaved + "h", label: "Time Saved" },
    { type: "solved", value: metrics.ticketsSolved, label: "Tickets Solved" },
    { type: "tenants", value: metrics.tenants, label: "Tenants Served" },
  ];
}

export default function Home() {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");

  // Get filtered buildings
  let filteredBuildings: Building[] = [];
  if (selectedCommunity === "all") {
    filteredBuildings = communities.flatMap((c) => c.buildings);
  } else {
    const comm = communities.find((c) => c.id === selectedCommunity);
    if (comm) {
      filteredBuildings = comm.buildings;
    }
  }
  if (selectedBuilding !== "all") {
    filteredBuildings = filteredBuildings.filter((b) => b.id === selectedBuilding);
  }

  const metrics = getMetrics(filteredBuildings);

  // Get building options for selected community
  const buildingOptions: Building[] = selectedCommunity === "all"
    ? communities.flatMap((c) => c.buildings)
    : (communities.find((c) => c.id === selectedCommunity)?.buildings || []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#232946] via-[#3a3f5a] to-[#1a1a2e] p-4 sm:p-8 lg:p-12">
      <div className="flex bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl w-full h-full max-w-[calc(100vw-6rem)] max-h-[calc(100vh-6rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          {/* Filter UI */}
          <div className="flex flex-wrap gap-4 mb-8 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
              <select
                className="block w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={selectedCommunity}
                onChange={(e) => {
                  setSelectedCommunity(e.target.value);
                  setSelectedBuilding("all");
                }}
              >
                <option value="all">All Communities</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <select
                className="block w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                <option value="all">All Buildings</option>
                {buildingOptions.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div className="w-full flex flex-wrap gap-6 justify-between items-stretch mb-8 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          {/* Map */}
          <div className="mt-8">
            <Map buildings={filteredBuildings} />
          </div>
        </main>
      </div>
    </div>
  );
}
