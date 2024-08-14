import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const Item = styled(Paper)(({ theme }) => ({
  elevation: 0,
  padding: theme.spacing(1),
  fontFamily: "League Spartan",
  fontSize: "1rem",
  textAlign: "left",
}));

const DataTuple = (props) => {
  const [table, setTable] = useState({ columns: [], row: [] });

  useEffect(() => {
    const row = [{ id: 1, ...props.sourceTuple }];
    const idColumn = { field: "id", headerName: "ID" };
    const otherColumns = Object.keys(props.sourceTuple).map((header) => ({
      field: header,
      headerName: header,
    }));
    const columns = [idColumn, ...otherColumns];

    setTable({ ...table, columns: columns, row: row });
  }, [props.sourceTuple]);

  return (
    <Box>
      <Item elevation={0} sx={{ backgroundColor: "#EDEDED" }}>
        Source: {props.sourceTableName}
      </Item>
      <Item elevation={0} sx={{ backgroundColor: "#EDEDED" }}>
        Row #: {props.sourceRowNumber}
      </Item>
      <DataGrid
        // rowHeight={63}
        // autoHeight
        rows={table.row}
        columns={table.columns}
        isRowSelectable={() => false}
        columnVisibilityModel={{ id: false }}
        hideFooter
        sx={{
          fontSize: "1.0 rem",
          ".MuiDataGrid-cell": {
            border: 1,
            borderColor: "#EDEDED",
          },
          "& .MuiDataGrid-columnHeader": {
            color: "white",
            backgroundColor: "black",
          },
        }}
      />
    </Box>
  );
};

export default DataTuple;
