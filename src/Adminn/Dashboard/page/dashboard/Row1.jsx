import { Stack, useTheme } from "@mui/material";
import React from "react";
import Card from "./card";
import EventIcon from "@mui/icons-material/Event"; // For visits
import PeopleIcon from "@mui/icons-material/People"; // For patients
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"; // For staff
import ScienceIcon from "@mui/icons-material/Science"; // For tests
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // For nurse (replacing NurseIcon)
import { Grid } from '@mui/material';

const Row1 = () => {
  const theme = useTheme();
  return (
    <Stack
      direction={"row"}
      flexWrap={"wrap"}
      gap={1}
      justifyContent={{ xs: "center", sm: "space-between" }}
    >
      <Card
        icon={<EventIcon sx={{ fontSize: "23px", color: "#009DA5" }} />}
        title="Scheduled Visits"
        subTitle="Today's bookings"
        increase="+12%"
        value="3500"
      />
      <Card
        icon={<PeopleIcon sx={{ fontSize: "23px", color: "#009DA5" }} />}
        title="New Patients"
        subTitle="New this week"
        increase="+15%"
        value="850"
      />
      <Card
        icon={<LocalHospitalIcon sx={{ fontSize: "23px", color: "#009DA5" }} />}
        title="Services"
        subTitle="On duty now"
        increase="+8%"
        value="500"
      />
      <Card
        icon={<ScienceIcon sx={{ fontSize: "23px", color: "#009DA5" }} />}
        title="Laboratories"
        subTitle="Completed today"
        increase="+20%"
        value="400"
      />
    </Stack>
  );
};

export default Row1;