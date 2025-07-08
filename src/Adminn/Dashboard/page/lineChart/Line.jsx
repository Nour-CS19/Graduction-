 
 
import React from "react";
import { Box, useTheme } from "@mui/material";

import { ResponsiveLine } from "@nivo/line";
const data = [
  {
    id: "patient",
    color: "hsl(4, 70%, 50%)",
    data: [
      { x: "appointments", y: 79 },
      { x: "visits", y: 28 },
      { x: "admissions", y: 150 },
      { x: "discharges", y: 173 },
      { x: "medications", y: 234 },
      { x: "tests", y: 98 },
      { x: "surgeries", y: 244 },
      { x: "follow-ups", y: 295 },
      { x: "vaccinations", y: 287 },
      { x: "referrals", y: 157 },
      { x: "emergencies", y: 239 },
      { x: "others", y: 69 },
    ],
  },
  {
    id: "doctor",
    color: "hsl(205, 70%, 50%)",
    data: [
      { x: "consultations", y: 278 },
      { x: "procedures", y: 222 },
      { x: "surgeries", y: 65 },
      { x: "rounds", y: 213 },
      { x: "reports", y: 89 },
      { x: "meetings", y: 278 },
      { x: "follow-ups", y: 231 },
      { x: "trainings", y: 47 },
      { x: "research", y: 126 },
      { x: "referrals", y: 191 },
      { x: "presentations", y: 95 },
      { x: "others", y: 26 },
    ],
  },
  {
    id: "nurse",
    color: "hsl(39, 70%, 50%)",
    data: [
      { x: "patientCare", y: 3 },
      { x: "medications", y: 187 },
      { x: "tests", y: 259 },
      { x: "rounds", y: 294 },
      { x: "admissions", y: 158 },
      { x: "discharges", y: 146 },
      { x: "trainings", y: 125 },
      { x: "emergencies", y: 253 },
      { x: "assistance", y: 230 },
      { x: "documentation", y: 287 },
      { x: "meetings", y: 193 },
      { x: "others", y: 12 },
    ],
  },
  {
    id: "lab",
    color: "hsl(179, 70%, 50%)",
    data: [
      { x: "bloodTests", y: 213 },
      { x: "urineTests", y: 271 },
      { x: "biopsies", y: 22 },
      { x: "cultures", y: 270 },
      { x: "imaging", y: 97 },
      { x: "genetics", y: 146 },
      { x: "research", y: 116 },
      { x: "consultations", y: 159 },
      { x: "dataAnalysis", y: 165 },
      { x: "reports", y: 210 },
      { x: "trainings", y: 76 },
      { x: "others", y: 126 },
    ],
  },
  {
    id: "admin",
    color: "hsl(120, 70%, 50%)",
    data: [
      { x: "registrations", y: 150 },
      { x: "scheduling", y: 200 },
      { x: "billing", y: 300 },
      { x: "staffManagement", y: 250 },
      { x: "inventory", y: 180 },
      { x: "reports", y: 220 },
      { x: "meetings", y: 170 },
      { x: "compliance", y: 90 },
      { x: "communications", y: 210 },
      { x: "documentation", y: 150 },
      { x: "customerService", y: 190 },
      { x: "others", y: 100 },
    ],
  },
];


const Line = ({isDahboard = false}) => {
  const theme = useTheme();
  return (
    <Box sx={{ height: isDahboard?  "280px"  :  "75vh" }}>
      <ResponsiveLine
        theme={{
          textColor: theme.palette.text.primary,
          fontSize: 11,
          axis: {
            domain: {
              line: {
                stroke: theme.palette.divider,
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 12,
                fill: theme.palette.text.primary,
              },
            },
            ticks: {
              line: {
                stroke: theme.palette.divider,
                strokeWidth: 1,
              },
              text: {
                fontSize: 11,
                fill: theme.palette.text.secondary,
              },
            },
          },
          grid: {
            line: {
              stroke: theme.palette.divider,
              strokeWidth: 0,
            },
          },
          legends: {
            title: {
              text: {
                fontSize: 11,
                fill: theme.palette.text.primary,
              },
            },
            text: {
              fontSize: 11,
              fill: theme.palette.text.primary,
            },
            ticks: {
              line: {},
              text: {
                fontSize: 10,
                fill: theme.palette.text.primary,
              },
            },
          },
          annotations: {
            text: {
              fontSize: 13,
              fill: theme.palette.text.primary,
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
            link: {
              stroke: "#000000",
              strokeWidth: 1,
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
            outline: {
              stroke: "#000000",
              strokeWidth: 2,
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
            symbol: {
              fill: "#000000",
              outlineWidth: 2,
              outlineColor: "#ffffff",
              outlineOpacity: 1,
            },
          },
          tooltip: {
            container: {
              background: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: 12,
            },
            basic: {},
            chip: {},
            table: {},
            tableCell: {},
            tableCellValue: {},
          },
        }}
        data={data}
        curve="catmullRom"
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: true,
          reverse: false,
        }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
 
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isDahboard? null : "transportation",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
       
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isDahboard? null : "Count",
          legendOffset: -45,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </Box>
  );
};

export default Line;
