import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";

import FileInput from "./FileInput";
import OptionButtonGroup from "./OptionButtonGroup";
import CustomSelect from "./CustomSelect";
import RadioButtonRegex from "./RadioButtonRegex";

const buttonTheme = createTheme({
  palette: {
    green: { main: "#1cc533", contrastText: "#ffffff" },
  },
  shape: { borderRadius: 40 },
});

const ComponentGridWithName = (name, WrappedComponent) => {
  return (props) => (
    <Grid container>
      <Grid xs={4}>
        <Paper elevation={0}>
          <Typography fontSize="1.3rem">{name}</Typography>
        </Paper>
      </Grid>
      <Grid xs={8}>
        <WrappedComponent {...props} />
      </Grid>
    </Grid>
  );
};

const LabeledDivider = (props) => {
  const theme = useTheme();
  const borderColor = theme.palette.border.main;
  return (
    <Grid xs={12}>
      <Divider
        textAlign="left"
        sx={{
          fontSize: "1.3rem",
          "&::before, &::after": { borderTop: 3, borderColor: borderColor },
        }}
      >
        {props.label}
      </Divider>
    </Grid>
  );
};

const DirtyDataFileInput = ComponentGridWithName("Corrupt Data", FileInput);
const EntityDescriptionTextField = ComponentGridWithName(
  "Entity Description",
  TextField
);
const DirtyColumnSelect = ComponentGridWithName("Target Column", CustomSelect);
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
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      height="100%"
      width="100%"
      padding={2}
      bgcolor={backgroundColor}
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
        includeNone={true}
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
        <ThemeProvider theme={buttonTheme}>
          <Button
            disabled={
              !props.isDirtyDataUploaded ||
              props.dirtyColumn === "" ||
              props.reasonerName == "" ||
              props.isLoading
            }
            disableElevation
            size="large"
            variant="contained"
            color="green"
            onClick={props.onRunJob}
            sx={{ width: "6rem", height: "3rem" }}
          >
            {props.isLoading ? <CircularProgress /> : "Start"}
          </Button>
        </ThemeProvider>
      </Grid>
    </Box>
  );
};

export default Panel;
