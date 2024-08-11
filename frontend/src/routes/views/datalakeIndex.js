import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Stack,
  Button,
  Tab,
  Typography,
  TextField,
  useTheme,
} from "@mui/material";
import { TrophySpin } from "react-loading-indicators";

import {
  getIndexes,
  createIndex,
  updateIndex,
  deleteIndex,
} from "../../api/index";

import CustomSelect from "../../components/CustomSelect";
import FileInput from "../../components/FileInput";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

const IndexModule = () => {
  const theme = useTheme();
  const borderColor = theme.palette.border.main;
  // States
  const [value, setValue] = useState(0);

  const [createIndexState, setCreateIndexState] = useState({
    indexName: "",
    fileName: "No file selected",
    files: [],
    isLoading: false,
  });
  const [updateIndexState, setUpdateIndexState] = useState({
    indexName: "",
    fileName: "No file selected",
    files: [],
    isLoading: false,
  });
  const [deleteIndexState, setDeleteIndexState] = useState({
    indexName: "",
    isLoading: false,
  });

  const [indexList, setIndexList] = useState([]);

  // Effects
  useEffect(() => {
    // const fetchIndexes = async () => {
    //   const data = await getIndexes();
    //   setIndexList(data);
    // };
    // fetchIndexes();

    let indexes = ["this one", "that one"];
    setIndexList(indexes);
  }, [
    createIndexState.isLoading,
    updateIndexState.isLoading,
    deleteIndexState.isLoading,
  ]);

  // Methods
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onChangecreateIndexStateName = (value) => {
    setCreateIndexState({
      ...createIndexState,
      indexName: value,
    });
  };

  const onSelectupdateIndexStateName = (value) => {
    setUpdateIndexState({
      ...updateIndexState,
      indexName: value,
    });
  };

  const onSelectdeleteIndexStateName = (value) => {
    setDeleteIndexState({
      ...deleteIndexState,
      indexName: value,
    });
  };

  const onChangeDataLakeFile = async (files, type) => {
    if (files.length === 0) return;

    const fullPath = files[0].webkitRelativePath;
    const fileName = fullPath.substring(0, fullPath.lastIndexOf("/"));

    let fileList = [];
    for (const file of files) {
      if (file.type === "text/csv") {
        fileList.push(file);
      }
    }

    if (type === "create") {
      setCreateIndexState({
        ...createIndexState,
        fileName: fileName,
        files: fileList,
      });
    } else if (type === "update") {
      setUpdateIndexState({
        ...updateIndexState,
        fileName: fileName,
        files: fileList,
      });
    }
  };

  const onCreateIndex = async () => {
    setCreateIndexState({
      ...createIndexState,
      isLoading: true,
    });
    const data = await createIndex(
      createIndexState.indexName,
      createIndexState.files
    );
    setCreateIndexState({
      ...createIndexState,
      isLoading: false,
    });
  };

  const onUpdateIndex = async () => {
    setUpdateIndexState({
      ...updateIndexState,
      isLoading: true,
    });
    const data = await updateIndex(
      updateIndexState.indexName,
      updateIndexState.files
    );
    setUpdateIndexState({
      ...updateIndexState,
      isLoading: false,
    });
  };

  const onDeleteIndex = async () => {
    setDeleteIndexState({
      ...deleteIndexState,
      isLoading: true,
    });
    const data = await deleteIndex(deleteIndexState.indexName);
    setDeleteIndexState({
      ...deleteIndexState,
      isLoading: false,
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      border={5}
      borderColor={borderColor}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        // sx={{ ".MuiTabs-flexContainer": { justifyContent: "center" } }}
        variant="fullWidth"
      >
        <Tab label="Create" id="tab-0" />
        <Tab label="Update" id="tab-1" />
        <Tab label="Delete" id="tab-2" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Box
          marginTop={3}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h5" sx={{ width: "60%" }}>
            Create a new data lake index by uploading a folder of CSV files.
            Provide a unique name for your index. The uploaded data will be
            indexed under this name for easy retrieval and management.
          </Typography>
          <Stack mt={10} spacing={2} width="38%">
            {createIndexState.isLoading ? (
              <TrophySpin
                color="#4caf50"
                style={{ fontSize: "40px" }}
                speedPlus="1"
                text={`Creating ${createIndexState.indexName}`}
              />
            ) : (
              <>
                <TextField
                  label="Index Name"
                  value={createIndexState.indexName}
                  onChange={(e) => onChangecreateIndexStateName(e.target.value)}
                />
                <FileInput
                  type="multiple"
                  fileName={createIndexState.fileName}
                  onChange={(e) => onChangeDataLakeFile(e, "create")}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onCreateIndex}
                >
                  Create
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box
          marginTop={3}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h5" sx={{ width: "60%" }}>
            Update an existing data lake index by selecting the index name.
            Upload a new folder of CSV files to add to the selected index. The
            new data will be indexed and merged with the selected index.
          </Typography>
          <Stack mt={10} spacing={2} width="38%">
            {updateIndexState.isLoading ? (
              <TrophySpin
                color="#1976d2"
                style={{ fontSize: "40px" }}
                speedPlus="1"
                text={`Updating ${updateIndexState.indexName}`}
              />
            ) : (
              <>
                <CustomSelect
                  label="Select"
                  selection={updateIndexState.indexName}
                  multiple={false}
                  includeGroupNames={false}
                  groupedOptions={[{ name: "columns", options: indexList }]}
                  onChange={onSelectupdateIndexStateName}
                />
                <FileInput
                  type="multiple"
                  fileName={updateIndexState.fileName}
                  onChange={(e) => onChangeDataLakeFile(e, "update")}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onUpdateIndex}
                >
                  Update
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box
          marginTop={3}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h5" sx={{ width: "60%" }}>
            Delete an existing data lake index by selecting the index name from
            the dropdown menu. This action will permanently remove the selected
            index and all its associated data from the system.
          </Typography>

          <Stack mt={10} spacing={2} width="38%">
            {deleteIndexState.isLoading ? (
              <TrophySpin
                color="#f44336"
                style={{ fontSize: "40px" }}
                speedPlus="1"
                text={`Deleting ${deleteIndexState.indexName}`}
              />
            ) : (
              <>
                <CustomSelect
                  label="Select"
                  selection={deleteIndexState.indexName}
                  multiple={false}
                  includeGroupNames={false}
                  groupedOptions={[{ name: "columns", options: indexList }]}
                  onChange={onSelectdeleteIndexStateName}
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={onDeleteIndex}
                >
                  Delete
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default IndexModule;
