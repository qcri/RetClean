/* eslint-disable */
import React, { forwardRef, useState } from "react";
import { Box, Stack, Button, ButtonGroup } from "@mui/material";
import { StylesProvider, createGenerateClassName } from "@material-ui/styles";

import AddBox from "@mui/icons-material/AddBox";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Check from "@mui/icons-material/Check";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import FilterList from "@mui/icons-material/FilterList";
import FirstPage from "@mui/icons-material/FirstPage";
import LastPage from "@mui/icons-material/LastPage";
import Remove from "@mui/icons-material/Remove";
import SaveAlt from "@mui/icons-material/SaveAlt";
import Search from "@mui/icons-material/Search";
import ViewColumn from "@mui/icons-material/ViewColumn";
import DoneIcon from "@mui/icons-material/Done";
import TableChartIcon from "@mui/icons-material/TableChart";
import CalculateIcon from "@mui/icons-material/Calculate";
import ClearIcon from "@mui/icons-material/Clear";

import MaterialTable, { MTableToolbar, MTableHeader } from "material-table";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const generateClassName = createGenerateClassName({
  productionPrefix: "mt",
  seed: "mt",
});

const Table = (props) => {
  const components = {
    Toolbar: (componentProps) => {
      return (
        <div>
          <MTableToolbar {...componentProps} />
          <div style={{ padding: "15px 15px 15px 15px" }}>
            <ButtonGroup
              variant="contained"
              aria-label="outlined primary button group"
            >
              <Button
                startIcon={<TableChartIcon />}
                onClick={(e) => props.toggleDrawer(true)(e)}
                disabled={props.disableDrawerButton}
              >
                Select Columns
              </Button>

              <Button
                startIcon={<CalculateIcon />}
                onClick={(e) => props.callImpute()}
              >
                Impute Target
              </Button>
              <Button
                startIcon={<DoneIcon />}
                onClick={(e) => props.saveChanges()}
              >
                Save Changes
              </Button>
              <Button
                startIcon={<ClearIcon />}
                onClick={(e) => props.cancelChanges()}
              >
                Cancel Changes
              </Button>
            </ButtonGroup>
          </div>
        </div>
      );
    },
    // Body: (props) => {
    //   //intervene before rendering table
    //   // console.log("tampering with some table data ", props);
    //   // console.log(" -- table data looks like this ", props.renderData);
    //   // do stuff..
    //   const myRenderData = props.renderData;

    //   return (
    //     <>
    //       <MTableBody {...props} renderData={myRenderData} />
    //       {/* to show that you will make impact */}
    //       {/* <MTableBody {...props} renderData={[]} /> */}
    //     </>
    //   );
    // },
  };

  return (
    <div>
      <Box m={10} justifyContent="center" alignItems="center">
        <Stack direction="row">
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
              icons={tableIcons}
              title={`Data File: ${props.filename}`}
              columns={props.columns}
              data={props.data}
              onRowClick={(event, rowData) => props.cellClick(event, rowData)}
              options={{
                pageSize: 20,
                filtering: true,
                exportButton: true,
                columnsButton: true,
                headerStyle: {
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#2196f3",
                  color: "#FFF",
                },
                cellStyle: { border: "1px solid #eee" },
              }}
              components={components}
            />
          </StylesProvider>
        </Stack>
      </Box>
    </div>
  );
};

export default Table;
