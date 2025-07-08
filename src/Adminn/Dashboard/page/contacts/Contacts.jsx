import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { columns, rows } from "C:/Users/NOUR SOFT/Desktop/Graduction Final/First/src/Adminn/Dashboard/page/contacts/data.js";

const Contacts = () => {
  return (
    <Box>
     

      <Box sx={{ height: 650, width: "99%", mx: "auto" }}>
        <DataGrid
          slots={{
            toolbar: GridToolbar,
          }}
          rows={rows}
          // @ts-ignore
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default Contacts;
