/* eslint-disable no-unused-vars */
import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { Box, useTheme } from "@mui/material";
import Pie from "./pie";

const PieChart = () => {
  const theme = useTheme();
  return (
    <Box>

      <Pie />
    </Box>
  );
};

export default PieChart;
