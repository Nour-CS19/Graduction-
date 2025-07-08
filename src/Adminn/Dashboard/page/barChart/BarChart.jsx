import React from 'react';
import { Box, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '@mui/material';

const data = [
  {
    year: 2019,
    Patient: 900,
    Doctor: 1400,
    Lab: 1700,
    Nurse: 1200,
    Admin: 800,
  },
  {
    year: 2020,
    Patient: 1000,
    Doctor: 1500,
    Lab: 1800,
    Nurse: 1300,
    Admin: 850,
  },
  {
    year: 2021,
    Patient: 1100,
    Doctor: 1600,
    Lab: 1900,
    Nurse: 1400,
    Admin: 900,
  },
  {
    year: 2022,
    Patient: 1200,
    Doctor: 1700,
    Lab: 2000,
    Nurse: 1500,
    Admin: 950,
  },
  {
    year: 2023,
    Patient: 1260,
    Doctor: 1709,
    Lab: 2080,
    Nurse: 1600,
    Admin: 1000,
  },
];

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h6">Bar Chart</Typography>
      <Box sx={{ height: isDashboard ? '300px' : '75vh' }}>
        <ResponsiveBar
          data={data}
          keys={['Patient', 'Doctor', 'Lab', 'Nurse', 'Admin']}
          indexBy="year"
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
                strokeWidth: 1,
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
                outlineColor: '#ffffff',
                outlineOpacity: 1,
              },
              link: {
                stroke: '#000000',
                strokeWidth: 1,
                outlineWidth: 2,
                outlineColor: '#ffffff',
                outlineOpacity: 1,
              },
              outline: {
                stroke: '#000000',
                strokeWidth: 2,
                outlineWidth: 2,
                outlineColor: '#ffffff',
                outlineOpacity: 1,
              },
              symbol: {
                fill: '#000000',
                outlineWidth: 2,
                outlineColor: '#ffffff',
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
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'paired' }}
          defs={[
            {
              id: 'dots',
              type: 'patternDots',
              background: 'inherit',
              color: '#38bcb2',
              size: 4,
              padding: 1,
              stagger: true,
            },
            {
              id: 'lines',
              type: 'patternLines',
              background: 'inherit',
              color: '#eed312',
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
            },
          ]}
          fill={[
            {
              match: {
                id: 'fries',
              },
              id: 'dots',
            },
            {
              match: {
                id: 'sandwich',
              },
              id: 'lines',
            },
          ]}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? null : 'Year',
            legendPosition: 'middle',
            legendOffset: 35,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? null : 'Count',
            legendPosition: 'middle',
            legendOffset: -55,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
          ariaLabel="Nivo bar chart demo"
          barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in year: ${e.indexValue}`}
        />
      </Box>
    </Box>
  );
};

export default BarChart;


