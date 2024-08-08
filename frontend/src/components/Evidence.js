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
  const [table, setTable] = useState({
    columns: [],
    row: [],
  });

  const createColumns = (headers) => {
    const idColumn = { field: "id", headerName: "ID", width: 70 };
    const otherColumns = headers.map((header) => ({
      field: header,
      headerName: header,
      width: 150,
    }));
    const columns = [idColumn, ...otherColumns];
    return columns;
  };

  useEffect(() => {
    let row = [props.sourceTuple];
    row[0]["id"] = 1;
    const headers = Object.keys(props.sourceTuple);
    const columns = createColumns(headers);

    setTable({
      ...table,
      columns: columns,
      row: row,
    });
  }, [props.sourceTuple]);

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Item elevation={0} sx={{ backgroundColor: "#EDEDED" }}>
        Source: {props.sourceTableName}
      </Item>
      <Item elevation={0} sx={{ backgroundColor: "#EDEDED" }}>
        Row #: {props.sourceRowNumber}
      </Item>
      <DataGrid
        rowHeight={63}
        autoHeight
        rows={table.row}
        columns={table.columns}
        isRowSelectable={() => false}
        columnVisibilityModel={{ id: false }}
        hideFooter
        sx={{
          fontSize: "0.8rem",
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
