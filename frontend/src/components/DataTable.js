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
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import InfoIcon from "@mui/icons-material/Info";

const CustomToolbar = (props) => {
  return (
    <GridToolbarContainer>
      <ButtonGroup
        disableElevation
        // variant="text"
        variant="contained"
        size="large"
        sx={{ mb: "4px", height: "3rem" }}
      >
        <GridToolbarFilterButton />
        <GridToolbarExport />
        {props.result.data.length !== 0 && (
          <Button
            startIcon={<KeyboardDoubleArrowDownIcon />}
            onClick={props.onApplyRepairs}
          >
            Apply Repairs
          </Button>
        )}
        {props.result.data.length !== 0 && (
          <Button
            startIcon={<NotInterestedIcon />}
            onClick={props.onCancelRepairs}
          >
            Cancel
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
              // onClick={(e) => console.log(params.id)}
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
      const data = props.dirtyDataContent;

      const idColumn = {
        field: "id",
        headerName: "ID",
        headerClassName: "normal--header",
      };

      const otherColumns = props.columns.map((header) => {
        const minWidth = 100;
        const contentWidth = Math.max(
          ...data.map((row) => row[header]?.toString().length * 10),
          header.length * 10
        );
        const width = Math.max(contentWidth, minWidth);
        const headerName =
          header === props.result.column
            ? `Repairs for: ${props.dirtyColumn}`
            : header;

        return {
          field: header,
          headerName: headerName,
          editable: true,
          width: width,
          headerClassName:
            header === props.result.column
              ? "result--header"
              : header === props.dirtyColumn
              ? "dirty--header"
              : props.pivotColumns.has(header)
              ? "pivot--header"
              : "normal--header",
          ...(header === props.result.column && {
            cellClassName: "result--cell",
            renderCell: (params) => <ResultCell {...{ params, props }} />,
          }),
        };
      });

      const columns = [idColumn, ...otherColumns];

      const rows = props.dirtyDataContent.map((data, i) => ({
        id: i,
        ...data,
      }));

      setTable({ ...table, columns, rows });
    }
  }, [props.dirtyDataContent, props.result, props.isDirtyDataUploaded]);

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

      setTable({ ...table, columns: columns });
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
      autosizeOptions={{ includeHeaders: false }}
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
