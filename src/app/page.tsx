"use client";

import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { communities } from "../data/dummyData";
import Map from "../components/Map";
import MetricCardRow from "../components/MetricCardRow";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import type { ReactNode } from "react";
import AIBubble from "../components/AIBubble";

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
  const [selectedCommunity, setSelectedCommunity] = useState<string[]>(["all"]);
  const [selectedBuilding, setSelectedBuilding] = useState<string[]>(["all"]);
  const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false);

  // Get filtered buildings
  let filteredBuildings: Building[] = [];
  if (selectedCommunity.includes("all")) {
    filteredBuildings = communities.flatMap((c) => c.buildings);
  } else {
    filteredBuildings = communities
      .filter((c) => selectedCommunity.includes(c.id))
      .flatMap((c) => c.buildings);
  }
  if (!selectedBuilding.includes("all")) {
    filteredBuildings = filteredBuildings.filter((b) => selectedBuilding.includes(b.id));
  }

  const metrics = getMetrics(filteredBuildings);

  // Get building options for selected community
  const buildingOptions: Building[] = selectedCommunity.includes("all")
    ? communities.flatMap((c) => c.buildings)
    : communities.filter((c) => selectedCommunity.includes(c.id)).flatMap((c) => c.buildings);

  // Get selected names for badges
  const selectedCommunityNames = selectedCommunity.includes("all")
    ? ["All Communities"]
    : communities.filter((c) => selectedCommunity.includes(c.id)).map((c) => c.name);
  const selectedBuildingNames = selectedBuilding.includes("all")
    ? ["All Buildings"]
    : buildingOptions.filter((b) => selectedBuilding.includes(b.id)).map((b) => b.name);

  return (
    <>
      <AIBubble />
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#232946] via-[#3a3f5a] to-[#1a1a2e] p-4 sm:p-8 lg:p-12">
      <div className="flex bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl w-full h-full max-w-[calc(100vw-6rem)] max-h-[calc(100vh-6rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          {/* Filter UI - Modern, wow-effect */}
          <div className="flex flex-wrap gap-4 mb-8 items-end">
            {/* Community segmented control - multi-select */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="block text-lg font-bold text-indigo-700 tracking-tight">Community</span>
              </div>
              <div className="flex rounded-full bg-gray-100 p-1 shadow-inner">
                <button
                  className={`px-4 py-2 rounded-full transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 border-2 ${selectedCommunity.includes("all") ? "bg-indigo-500 text-white border-indigo-400 shadow" : "text-gray-700 hover:bg-gray-200 border-transparent"}`}
                  style={{ boxShadow: selectedCommunity.includes("all") ? "0 2px 8px 0 rgba(99,102,241,0.10)" : undefined }}
                  onClick={() => {
                    if (selectedCommunity.includes("all")) {
                      setSelectedCommunity([]);
                    } else {
                      setSelectedCommunity(["all"]);
                    }
                    setSelectedBuilding(["all"]);
                  }}
                >
                  All
                </button>
                {communities.map((c) => (
                  <button
                    key={c.id}
                    className={`px-4 py-2 rounded-full transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 border-2 ${selectedCommunity.includes(c.id) ? "bg-indigo-500 text-white border-indigo-400 shadow" : "text-gray-700 hover:bg-gray-200 border-transparent"}`}
                    style={{ boxShadow: selectedCommunity.includes(c.id) ? "0 2px 8px 0 rgba(99,102,241,0.10)" : undefined }}
                    onClick={() => {
                      let newSelected = [...selectedCommunity];
                      if (newSelected.includes("all")) newSelected = [];
                      if (newSelected.includes(c.id)) {
                        newSelected = newSelected.filter((id) => id !== c.id);
                      } else {
                        newSelected.push(c.id);
                      }
                      if (newSelected.length === 0) newSelected = ["all"];
                      setSelectedCommunity(newSelected);
                      setSelectedBuilding(["all"]);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Building custom dropdown - multi-select, modern design */}
            <div className="relative min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="block text-lg font-bold text-indigo-700 tracking-tight">Building</span>
              </div>
              <button
                className="w-full flex items-center justify-between px-5 py-2 bg-white rounded-full border border-gray-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:shadow-md text-base font-semibold text-gray-900"
                onClick={() => setBuildingDropdownOpen((open) => !open)}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={buildingDropdownOpen}
              >
                <span className="flex items-center gap-2">
                  <IconBuildingSkyscraper className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-gray-900">{selectedBuildingNames.join(", ")}</span>
                </span>
                <svg className={`w-4 h-4 ml-2 transition-transform ${buildingDropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {buildingDropdownOpen && (
                <ul
                  className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto animate-fade-in"
                  tabIndex={-1}
                  role="listbox"
                  onBlur={() => setBuildingDropdownOpen(false)}
                >
                  <li
                    className={`flex items-center gap-2 px-5 py-2 cursor-pointer rounded-full transition-all text-base font-semibold ${selectedBuilding.includes("all") ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      if (selectedBuilding.includes("all")) {
                        setSelectedBuilding([]);
                      } else {
                        setSelectedBuilding(["all"]);
                      }
                    }}
                    role="option"
                    aria-selected={selectedBuilding.includes("all")}
                  >
                    <input type="checkbox" checked={selectedBuilding.includes("all")}/>
                    <IconBuildingSkyscraper className="w-5 h-5 text-indigo-400" />
                    All Buildings
                  </li>
                  {buildingOptions.map((b) => (
                    <li
                      key={b.id}
                      className={`flex items-center gap-2 px-5 py-2 cursor-pointer rounded-full transition-all text-base font-semibold ${selectedBuilding.includes(b.id) ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                      onClick={() => {
                        let newSelected = [...selectedBuilding];
                        if (newSelected.includes("all")) newSelected = [];
                        if (newSelected.includes(b.id)) {
                          newSelected = newSelected.filter((id) => id !== b.id);
                        } else {
                          newSelected.push(b.id);
                        }
                        if (newSelected.length === 0) newSelected = ["all"];
                        setSelectedBuilding(newSelected);
                      }}
                      role="option"
                      aria-selected={selectedBuilding.includes(b.id)}
                    >
                      <input type="checkbox" checked={selectedBuilding.includes(b.id)}/>
                      <IconBuildingSkyscraper className="w-5 h-5 text-indigo-400" />
                      {b.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Metrics */}
          <MetricCardRow 
            ticketsOpen={Number(metrics.find(m => m.type === "open")?.value) || 0}
            ticketsClosed={Number(metrics.find(m => m.type === "closed")?.value) || 0}
            ticketsSolved={Number(metrics.find(m => m.type === "solved")?.value) || 0}
            timeSaved={Number(metrics.find(m => m.type === "time")?.value?.toString().replace("h", "")) || 0}
            tenants={Number(metrics.find(m => m.type === "tenants")?.value) || 0}
          />

          {/* Map */}
          <div className="mt-8">
            <Map buildings={filteredBuildings} />
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
