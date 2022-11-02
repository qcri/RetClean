import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { updateData } from "../../features/data/dataSlice";
import { getParsedData, createDataObject } from "../../services/data";

import Directions from "../../components/Directions";
import FileInput from "../../components/FileUpload";
import NextLink from "../../components/NextLink";

export const DataPage = () => {
  const dispatch = useDispatch();
  const pageDirections =
    "Select and upload your data. We currently support csv and json formats.";
  const [acquiredData, setAcquiredData] = useState({
    selectedFile: null,
    fileName: "No file selected",
    submitted: false,
  });

  const onChangeUserDataFile = async (event) => {
    let file = event.target.files[0];
    let content = await getParsedData(file);
    let dataObject = createDataObject(content);
    let payload = {
      filename: file.name,
      dataObject: dataObject,
    };
    dispatch(updateData(payload));
    setAcquiredData({
      ...acquiredData,
      selectedFile: file,
      fileName: file.name,
      submitted: true,
    });
  };

  return (
    <div>
      <Directions text={pageDirections} />
      <FileInput
        fileName={acquiredData.fileName}
        onChange={onChangeUserDataFile}
      ></FileInput>
      <NextLink
        disabled={!acquiredData.submitted}
        next={"/table"}
        text={"Next"}
      />
    </div>
  );
};
