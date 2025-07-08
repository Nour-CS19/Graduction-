import { Paper, Stack, Typography, useTheme } from "@mui/material";
import Pie from "../pieChart/PieChart";
import React from "react";
import Bar from "../barChart/BarChart";

const Row3 = () => {
  const theme = useTheme();
  return (
    <Stack gap={1.5} direction={"row"} flexWrap={"wrap"} mt={1.4}>
      <Paper
        sx={{
          flexGrow: 1,
          minWidth: "400px",
          width: "28%",
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: "#fafafa",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          color={theme.palette.text.primary}
          sx={{ padding: "20px 20px 0 20px" }}
          variant="h6"
          fontWeight="600"
        >
          Statues
        </Typography>
        <Pie isDashboard={true} />
        <Typography variant="h6" align="center" sx={{ mt: "15px" }}>
          2,Patients
        </Typography>
        <Typography
          variant="body2"
          px={0.7}
          pb={2}
          align="center"
          color="text.secondary"
        >
          Breakdown by status
        </Typography>
      </Paper>

      <Paper
        sx={{
          flexGrow: 1,
          minWidth: "400px",
          width: "33%",
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: "#fafafa",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          color={theme.palette.text.primary}
          variant="h6"
          fontWeight="600"
          sx={{ padding: "20px 20px 0 20px" }}
        >
          Activity
        </Typography>
        <Bar isDashboard={true} />
      </Paper>

      
    </Stack>
  );
};

export default Row3;