import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Box,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
} from "@mui/x-data-grid";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import InfoIcon from "@mui/icons-material/Info";

const CustomToolbar = (props) => {
  return (
    <GridToolbarContainer sx={{ backgroundColor: "#EDEDED" }}>
      {/* <GridToolbarFilterButton /> */}
      <ButtonGroup
        disableElevation
        variant="text"
        size="large"
        sx={{ my: "0.2rem", height: "3rem" }}
      >
        <GridToolbarExport sx={{ fontSize: "1rem" }} />
        {props.result.data.length !== 0 && (
          <Button
            startIcon={<KeyboardDoubleArrowDownIcon />}
            onClick={props.onApplyRepairs}
          >
            Apply Repairs
          </Button>
        )}
      </ButtonGroup>
    </GridToolbarContainer>
  );
};

const ResultCell = ({ params, props }) => {
  return (
    <Box>
      {params.value !== "" && params.value !== "UNKOWN" ? (
        <Box>
          <Tooltip title={params.value}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.result.marked.has(params.id)}
                  onChange={(e) => props.onMarkResult(params.id)}
                />
              }
              label={params.value}
            />
          </Tooltip>
          {props.isIndexSelected && (
            <Button
              startIcon={<InfoIcon />}
              onClick={(e) => props.onShowEvidence(params.id)}
            ></Button>
          )}
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

const DataTable = (props) => {
  const [table, setTable] = useState({
    columns: {},
    rows: [],
  });

  useEffect(() => {
    if (props.isDirtyDataUploaded) {
      const idColumn = [
        "id",
        {
          field: "id",
          headerName: "ID",
          width: 70,
          headerClassName: "normal--header",
        },
      ];
      const otherColumns = props.columns.map((header) => {
        let column = {
          field: header,
          headerName:
            header === props.result.column
              ? `${props.dirtyColumn} repairs`
              : header,
          width: 150,
          editable: true,
          headerClassName:
            header === props.result.column
              ? "result--header"
              : header === props.dirtyColumn
              ? "dirty--header"
              : props.pivotColumns.has(header)
              ? "pivot--header"
              : "normal--header",
        };
        return [
          header,
          {
            ...column,
            ...(header === props.result.column
              ? {
                  cellClassName: "result--cell",
                  renderCell: (params) => <ResultCell {...{ params, props }} />,
                }
              : {}),
          },
        ];
      });

      const columns = Object.fromEntries([idColumn, ...otherColumns]);
      const rows = [...Array(props.dirtyDataContent.length).keys()].map(
        (i) => ({ id: i, ...props.dirtyDataContent[i] })
      );

      setTable({
        ...table,
        columns: columns,
        rows: rows,
      });
    }
  }, [props.dirtyDataContent, props.result]);

  useEffect(() => {
    if (props.isDirtyDataUploaded) {
      let columns = { ...table.columns };
      for (const column in table.columns) {
        column === props.result.column
          ? (columns[column]["headerClassName"] = "result--header")
          : props.pivotColumns.has(column) && column !== props.dirtyColumn
          ? (columns[column]["headerClassName"] = "pivot--header")
          : column === props.dirtyColumn
          ? (columns[props.dirtyColumn]["headerClassName"] = "dirty--header")
          : (columns[column]["headerClassName"] = "normal--header");
      }

      setTable({
        ...table,
        columns: columns,
      });
    }
  }, [props.dirtyColumn, props.pivotColumns]);

  return (
    <DataGrid
      height="100%"
      rows={table.rows}
      columns={Object.values(table.columns)}
      onRowSelectionModelChange={(ids) => console.log(ids)}
      isRowSelectable={() => false}
      CustomToolbar={CustomToolbar}
      slots={{ toolbar: () => CustomToolbar(props) }}
      sx={{
        fontSize: "0.8rem",
        ".MuiDataGrid-cell": {
          border: 1,
          borderColor: "#EDEDED",
        },
        "& .MuiDataGrid-sortIcon": {
          opacity: 1,
          color: "white",
        },
        "& .MuiDataGrid-menuIconButton": {
          opacity: 1,
          color: "white",
        },
        "& .normal--header": {
          backgroundColor: "black",
          color: "white",
        },
        "& .dirty--header": {
          backgroundColor: "#bf0303",
          color: "white",
        },
        "& .pivot--header": {
          backgroundColor: "orange",
          color: "white",
        },
        "& .result--header, & .result--cell": {
          borderLeft: 4,
          borderLeftColor: "black",
        },
        "& .result--header": {
          backgroundColor: "green",
          color: "white",
        },
      }}
    />
  );
};

export default DataTable;
