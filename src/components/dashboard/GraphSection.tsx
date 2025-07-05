"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Box,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";

import type { GraphData } from "../../types";
import { getGraphData } from "../../services/dashboardService";

import LineChart from "../charts/LineChart";
import BarChart from "../charts/BarChart";
import PieChart from "../charts/PieChart";

const GraphSection: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

  const { data, isLoading, isError } = useQuery<GraphData>({
    queryKey: ["graphData"],
    queryFn: getGraphData,
  });

  const getFilteredData = (data: GraphData) => {
    const limit =
      timeframe === "week"
        ? 7
        : timeframe === "month"
        ? 30
        : data.hospitalizations.length;

    return {
      hospitalizations: data.hospitalizations.slice(-limit),
      bedOccupancy: data.bedOccupancy.slice(-limit),
      hospitalizationReasons: data.hospitalizationReasons,
    };
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6">
          Erreur lors du chargement des graphiques
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Veuillez réessayer plus tard
        </Typography>
      </Box>
    );
  }

  const filtered = getFilteredData(data);

  return (
    <section className="p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Visualisations</h2>
        <div className="space-x-2">
          <Button
            variant={timeframe === "week" ? "contained" : "outlined"}
            onClick={() => setTimeframe("week")}
          >
            7 jours
          </Button>
          <Button
            variant={timeframe === "month" ? "contained" : "outlined"}
            onClick={() => setTimeframe("month")}
          >
            30 jours
          </Button>
          <Button
            variant={timeframe === "year" ? "contained" : "outlined"}
            onClick={() => setTimeframe("year")}
          >
            12 mois
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-card shadow-lg rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Hospitalisations</h3>
          <div className="h-64">
            <LineChart data={filtered.hospitalizations} />
          </div>
        </div>

        <div className="bg-card shadow-lg rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Taux d’occupation des lits</h3>
          <div className="h-64">
            <BarChart data={filtered.bedOccupancy} />
          </div>
        </div>

        <div className="bg-card shadow-lg rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Raisons d’hospitalisation</h3>
          <div className="h-64">
            <PieChart data={filtered.hospitalizationReasons} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GraphSection;
