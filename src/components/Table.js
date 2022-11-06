/* eslint-disable */
import React, { forwardRef } from "react";
import {
  Box,
  Stack,
  Button,
  ButtonGroup,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AddBox,
  ArrowDownward,
  Check,
  ChevronLeft,
  ChevronRight,
  Clear,
  DeleteOutline,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Remove,
  SaveAlt,
  Search,
  ViewColumn,
  Done,
  TableChart,
  Calculate,
} from "@mui/icons-material";
import { StylesProvider, createGenerateClassName } from "@material-ui/styles";
import MaterialTable, { MTableToolbar, MTableHeader } from "material-table";
import { text } from "d3";

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
              size="large"
              variant="contained"
              aria-label="outlined primary button group"
            >
              {!props.imputePhase ? (
                <>
                  <Button
                    startIcon={<TableChart />}
                    onClick={(e) => props.toggleDrawer(true)(e)}
                  >
                    Select Columns
                  </Button>
                  <Button
                    startIcon={<Calculate />}
                    onClick={(e) => props.callImpute()}
                  >
                    Impute Target
                  </Button>
                  <Button>
                    <FormControl size="small">
                      <Select
                        sx={{ color: "#FFF", Border: "none" }}
                        value={props.numK}
                        onChange={(e) => props.selectK(e.target.value)}
                      >
                        <MenuItem value={1}>K = 1</MenuItem>
                        <MenuItem value={2}>K = 2</MenuItem>
                        <MenuItem value={3}>K = 3</MenuItem>
                        <MenuItem value={4}>K = 4</MenuItem>
                        <MenuItem value={5}>K = 5</MenuItem>
                      </Select>
                    </FormControl>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    startIcon={<Done />}
                    onClick={(e) => props.saveChanges()}
                  >
                    Save Changes
                  </Button>
                  <Button
                    startIcon={<Clear />}
                    onClick={(e) => props.cancelChanges()}
                  >
                    Cancel Changes
                  </Button>
                </>
              )}
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
    <div style={{ overflowX: "auto", padding: "20px" }}>
      <Box justifyContent="center" alignItems="center">
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
