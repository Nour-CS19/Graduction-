import React from "react";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";

const Card = ({ icon, title, subTitle, increase, value }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        flexGrow: 1,
        minWidth: "250px",
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: "#fafafa",
        border: `1px solid ${theme.palette.divider}`,
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <Stack gap={1} sx={{ maxWidth: "60%" }}>
        {icon}
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.9rem",
            color: theme.palette.text.secondary,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.9rem",
            color: theme.palette.text.secondary,
          }}
        >
          {subTitle}
        </Typography>
      </Stack>
      <Stack alignItems="center" gap={1}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            bgcolor: "#e0f7fa", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#009DA5",
            fontWeight: 700,
          }}
        >
          <Typography variant="h6">{value}</Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.9rem",
            color: theme.palette.success.main,
            fontWeight: 500,
          }}
        >
          {increase}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default Card;