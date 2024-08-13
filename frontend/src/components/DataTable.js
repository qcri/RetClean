import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Box,
  Tooltip,
  Checkbox,
  FormControlLabel,
  useTheme,
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
    <GridToolbarContainer>
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
      {params.value !== null ? (
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
  const theme = useTheme();
  const headerTextColor = theme.palette.custom.table.headers.color;
  const headerBackgroundColor =
    theme.palette.custom.table.headers.backgroundColor;
  const tableBorderColor = theme.palette.custom.table.border.main;
  const [table, setTable] = useState({ columns: {}, rows: [] });

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
              ? `Repairs for: ${props.dirtyColumn}`
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

      setTable({ ...table, columns: columns, rows: rows });
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
        fontSize: "1.0 rem",
        ".MuiDataGrid-cell": {
          border: 1,
          borderColor: tableBorderColor,
        },
        "& .MuiDataGrid-sortIcon": {
          opacity: 1,
          color: headerTextColor,
        },
        "& .MuiDataGrid-menuIconButton": {
          opacity: 1,
          color: headerTextColor,
        },
        "& .normal--header": {
          backgroundColor: headerBackgroundColor,
          color: headerTextColor,
        },
        "& .dirty--header": {
          backgroundColor: "red",
          color: headerTextColor,
        },
        "& .pivot--header": {
          backgroundColor: "orange",
          color: headerTextColor,
        },
        "& .result--header": {
          backgroundColor: "green",
          color: headerTextColor,
        },
      }}
    />
  );
};

export default DataTable;
