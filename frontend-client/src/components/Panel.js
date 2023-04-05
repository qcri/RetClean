import React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Paper, Divider, TextField, Button } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import FileInput from "./FileUpload";
import OptionButtonGroup from "./OptionButtonGroup";
import SingleSelect from "./SingleSelect";
import MultipleSelectCheckmarks from "./MultiSelct";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#EDEDED",
  elevation: 0,
  paddingTop: theme.spacing(2),
  paddingLeft: theme.spacing(1),
  fontFamily: "League Spartan",
  fontSize: "1.2rem",
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

const Panel = (props) => {
  return (
    <Box sx={{ bgcolor: "#EDEDED" }}>
      <Grid container rowSpacing={3.5} columnSpacing={1} sx={{ m: 0.1 }}>
        <Grid xs={4}>
          <Item elevation={0}>Data</Item>
        </Grid>
        <Grid xs={8}>
          <FileInput
            type="data"
            value={props.entityName}
            fileName={props.dirtyDataFileName}
            onChange={props.onChangeDirtyDataFile}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Entity Name</Item>
        </Grid>
        <Grid xs={8}>
          <TextField
            fullWidth
            value={props.entityName}
            onChange={(e) => props.onChangeEntityName(e.target.value)}
            sx={{ backgroundColor: "white" }}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Dirty Column</Item>
        </Grid>
        <Grid xs={8}>
          <SingleSelect
            disabled={!props.isDirtyDataUploaded}
            label="Select"
            selection={props.dirtyColumn}
            options={props.columns}
            onChange={props.onSelectDirtyColumn}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Pivot Columns</Item>
        </Grid>
        <Grid xs={8}>
          <MultipleSelectCheckmarks
            disabled={!props.isDirtyDataUploaded}
            label="Select"
            selection={[...props.pivotColumns]}
            options={props.columns}
            onChange={props.onSelectPivotColumns}
          />
        </Grid>
        <Grid xs={12}>
          <Divider
            textAlign="left"
            sx={{
              m: 2,
              fontFamily: "League Spartan",
              fontSize: "1.2rem",
              "&::before, &::after": {
                borderTop: 3,
                borderColor: "black",
              },
            }}
          >
            Retrieval-Based Options
          </Divider>
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Data Lake</Item>
        </Grid>
        <Grid xs={8}>
          <FileInput
            type="datalake"
            fileName={props.dataLakeFileName}
            onChange={props.onChangeDataLakeFile}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Index Name</Item>
        </Grid>
        <Grid xs={8}>
          <TextField
            fullWidth
            value={props.indexName}
            onChange={(e) => props.onChangeIndexName(e.target.value)}
            sx={{ backgroundColor: "white" }}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Index Type</Item>
        </Grid>
        <Grid xs={8}>
          <OptionButtonGroup
            disabled={!props.isDataLakeUploaded}
            onClick={props.onSelectRetrieveOptions}
            options={props.indexState}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Reranker</Item>
        </Grid>
        <Grid xs={8}>
          <OptionButtonGroup
            disabled={!props.isDataLakeUploaded}
            onClick={props.onSelectRetrieveOptions}
            options={props.rerankState}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Reasoner</Item>
        </Grid>
        <Grid xs={8}>
          <OptionButtonGroup
            disabled={!props.isDataLakeUploaded}
            onClick={props.onSelectRetrieveOptions}
            options={props.reasonState}
          />
        </Grid>
        <Grid xs={4}>
          <Item elevation={0}>Fine Tuning</Item>
        </Grid>
        <Grid xs={8}>
          <FileInput
            disabled={
              !(props.isDataLakeUploaded && !props.reasonState["ChatGPT"])
            }
            type="samples"
            fileName={props.fineTuneFileName}
            onChange={props.onChangeFineTuneFile}
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            disabled={
              !(props.isDataLakeUploaded && !props.reasonState["Local Model"])
            }
            fullWidth
            value={props.prompt}
            onChange={(e) => props.onChangePrompt(e.target.value)}
            label="Prompt"
            multiline
            rows={5}
            sx={{ backgroundColor: "white" }}
          />
        </Grid>
        <Grid mdOffset="auto">
          <ThemeProvider theme={theme}>
            <Button
              disabled={!props.isDirtyDataUploaded || props.dirtyColumn === ""}
              disableElevation
              size="large"
              variant="contained"
              color="green"
              onClick={props.onRunJob}
              sx={{ mb: 1, width: 120, height: 60 }}
            >
              Start
            </Button>
          </ThemeProvider>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Panel;
