import React, { useState, useEffect, useRef } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  ButtonGroup,
  Tooltip,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import InfoIcon from "@mui/icons-material/Info";

const CustomToolbar = (props) => (
  <GridToolbarContainer>
    <ButtonGroup
      disableElevation
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
          {props.isRepair ? "Apply Repairs" : "Add Column"}
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

const ResultCell = (props) => (
  <Box>
    {props.params.value !== null && (
      <Box>
        <Tooltip title={props.params.value}>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.result.marked.has(props.params.id)}
                onChange={() => props.onMarkResult(props.params.id)}
              />
            }
            label={props.params.value}
          />
        </Tooltip>
        {props.isIndexSelected && (
          <Button
            startIcon={<InfoIcon />}
            onClick={() => props.onShowEvidence(props.params.id)}
          />
        )}
      </Box>
    )}
  </Box>
);

const DataTable = (props) => {
  const theme = useTheme();
  const headerTextColor = theme.palette.custom.table.headers.color;
  const headerBackgroundColor =
    theme.palette.custom.table.headers.backgroundColor;
  const tableBorderColor = theme.palette.custom.table.border.main;
  const [table, setTable] = useState({ columns: [], rows: [] });
  const apiRef = useGridApiRef(); // Add apiRef for DataGrid
  const [resultColumnAdded, setResultColumnAdded] = useState(false);

  useEffect(() => {
    if (props.isDirtyDataUploaded) {
      const rows = props.dirtyDataContent.map((data, i) => ({
        id: i,
        ...data,
      }));
      const idColumn = {
        field: "id",
        headerName: "ID",
        headerClassName: "normal--header",
      };

      const updatedColumns = props.columns.map((header) => ({
        field: header,
        editable: true,
        width: Math.max(
          ...props.dirtyDataContent.map(
            (row) => row[header]?.toString().length * 10
          ),
          header.length * 10
        ),
        headerClassName: getHeaderClass(header, props),
        ...(header === props.resultColumn && {
          cellClassName: "result--cell",
          renderCell: (params) => (
            <ResultCell
              params={params}
              result={props.result}
              isIndexSelected={props.isIndexSelected}
              onMarkResult={props.onMarkResult}
              onShowEvidence={props.onShowEvidence}
            />
          ),
        }),
      }));

      // Check if the result column is added for the first time
      if (
        !table.columns.some((col) => col.field === props.resultColumn) &&
        props.columns.includes(props.resultColumn)
      ) {
        setResultColumnAdded(true);
      }

      setTable({ columns: [idColumn, ...updatedColumns], rows });
    }
  }, [
    props.dirtyDataContent,
    props.isDirtyDataUploaded,
    props.result,
    props.onMarkResult,
    props.onShowEvidence,
    props.dirtyColumn,
    props.pivotColumns,
    props.resultColumn,
  ]);

  // Scroll to the right when the resultColumn is added for the first time
  useEffect(() => {
    if (resultColumnAdded) {
      setTimeout(() => {
        apiRef.current.scrollToIndexes({
          rowIndex: 0,
          colIndex: table.columns.length - 1,
        });
      }, 0);
      setResultColumnAdded(false);
    }
  }, [resultColumnAdded, table.columns.length, apiRef]);

  const getHeaderClass = (header, props) => {
    if (header === props.resultColumn) return "result--header";
    if (header === props.dirtyColumn && header !== props.resultColumn)
      return "dirty--header";
    if (
      props.pivotColumns.has(header) &&
      header !== props.resultColumn &&
      header !== props.dirtyColumn
    )
      return "pivot--header";
    return "normal--header";
  };

  return (
    <DataGrid
      apiRef={apiRef} // Attach the apiRef to the DataGrid
      rows={table.rows}
      columns={table.columns}
      isRowSelectable={() => false}
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
