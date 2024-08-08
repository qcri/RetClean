import React, { ComponentType } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Paper,
  Divider,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import FileInput from "./FileInput";
import OptionButtonGroup from "./OptionButtonGroup";
import CustomSelect from "./CustomSelect";
import RadioButtonRegex from "./RadioButtonRegex";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#EDEDED",
  fontFamily: "League Spartan",
  fontSize: "1.3rem",
  textAlign: "left",
  color: "black",
}));

const theme = createTheme({
  palette: {
    green: {
      main: "#1cc533",
      contrastText: "#ffffff",
    },
  },
  shape: {
    borderRadius: 40,
  },
});

const ComponentGridWithName = (name, WrappedComponent) => {
  return (props) => (
    <Grid container>
      <Grid xs={4}>
        <Item elevation={0}>{name}</Item>
      </Grid>
      <Grid xs={8}>
        <WrappedComponent {...props} />
      </Grid>
    </Grid>
  );
};

const LabeledDivider = (props) => (
  <Grid xs={12}>
    <Divider
      textAlign="left"
      sx={{
        color: "black",
        fontFamily: "League Spartan",
        fontSize: "1.3rem",
        "&::before, &::after": {
          borderTop: 3,
          borderColor: "black",
        },
      }}
    >
      {props.label}
    </Divider>
  </Grid>
);

const DirtyDataFileInput = ComponentGridWithName("Data", FileInput);
const EntityDescriptionTextField = ComponentGridWithName(
  "Entity Description",
  TextField
);
const DirtyColumnSelect = ComponentGridWithName("Dirty Column", CustomSelect);
const RepairOptionRadioButtons = ComponentGridWithName(
  "Repair Values",
  RadioButtonRegex
);
const PivotColumnSelect = ComponentGridWithName("Pivot Columns", CustomSelect);
const ReasonerSelect = ComponentGridWithName("Reasoner", CustomSelect);
const IndexNameSelect = ComponentGridWithName(
  "Search Index Name",
  CustomSelect
);
const IndexTypeOptionButtonGroup = ComponentGridWithName(
  "Index Type",
  OptionButtonGroup
);
const RerankerOptionButtonGroup = ComponentGridWithName(
  "Reranker Type",
  OptionButtonGroup
);

const Panel = (props) => {
  return (
    <Box
      display="flex"
      // height="100%"
      // width="100%"
      flexDirection="column"
      justifyContent="space-between"
      padding={1}
      sx={{ bgcolor: "#EDEDED" }}
    >
      <DirtyDataFileInput
        type="single"
        fileName={props.dirtyDataFileName}
        onChange={props.onChangeDirtyDataFile}
      />
      <EntityDescriptionTextField
        disabled={!props.isDirtyDataUploaded}
        label="Entity is ..."
        fullWidth
        multiline
        rows={2}
        value={props.entityDescription}
        onChange={(e) => props.onChangeEntityDescription(e.target.value)}
        sx={{ bgcolor: "white" }}
      />
      <DirtyColumnSelect
        disabled={!props.isDirtyDataUploaded}
        label="Select"
        selection={props.dirtyColumn}
        multiple={false}
        includeGroupNames={false}
        groupedOptions={[{ name: "columns", options: props.columns }]}
        onChange={props.onSelectDirtyColumn}
      />
      <RepairOptionRadioButtons
        disabledFormRadioButtons={!props.isDirtyDataUploaded}
        disabledTextField={!props.isRepairOptionCustom}
        options={props.repairOptionState}
        onChangeOption={props.onChangeRepairOption}
        text={props.repairString}
        onChangeText={props.onChangeRepairString}
        defaultStrings={props.repairOptionDefaultStrings}
      />
      <PivotColumnSelect
        disabled={!props.isDirtyDataUploaded}
        label="Select"
        selection={[...props.pivotColumns]}
        multiple={true}
        includeGroupNames={false}
        groupedOptions={[{ name: "columns", options: props.columns }]}
        onChange={props.onSelectPivotColumns}
      />
      <ReasonerSelect
        label="Select"
        selection={props.reasonerName}
        includeGroupNames={true}
        groupedOptions={props.reasonerNames}
        onChange={props.onSelectReasonerName}
      />

      <LabeledDivider label="Retrieval Options" />

      <IndexNameSelect
        label="Select"
        selection={props.searchIndexName}
        multiple={false}
        includeGroupNames={false}
        groupedOptions={[{ name: "indices", options: props.searchIndexNames }]}
        onChange={props.onSelectSearchIndexName}
      />
      <IndexTypeOptionButtonGroup
        disabled={props.searchIndexName === ""}
        options={props.indexState}
        onClick={props.onChangeIndexType}
      />
      <RerankerOptionButtonGroup
        disabled={props.searchIndexName === ""}
        options={props.rerankState}
        onClick={props.onChangeRerankType}
      />

      <Grid mdOffset="auto">
        <ThemeProvider theme={theme}>
          <Button
            disabled={!props.isDirtyDataUploaded || props.dirtyColumn === ""}
            disableElevation
            size="large"
            variant="contained"
            color="green"
            onClick={props.onRunJob}
            sx={{ width: "6rem", height: "3rem" }}
          >
            {props.load ? <CircularProgress /> : "Start"}
          </Button>
        </ThemeProvider>
      </Grid>
    </Box>
  );
};

export default Panel;
