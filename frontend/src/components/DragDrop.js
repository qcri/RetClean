import React, { useState } from "react";
import { FormControl, FormLabel, useTheme } from "@mui/material";

const DragDropFile = (props) => {
  const theme = useTheme();
  const textColor = theme.palette.text.dragDrop;
  const borderColor = theme.palette.custom.dragDrop.borderColor;
  const activeColor = theme.palette.custom.dragDrop.backgroundColor.active;
  const inactiveColor = theme.palette.custom.dragDrop.backgroundColor.inactive;

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      props.onChange(e.dataTransfer.files);
    }
  };

  return (
    <FormControl
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <FormLabel
        sx={{
          fontSize: "2.0rem",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderStyle: "dashed",
          color: textColor,
          borderColor: { borderColor },
          borderRadius: 10,
          backgroundColor: dragActive ? activeColor : inactiveColor,
          textDecorationLine: dragActive ? "underline" : "none",
        }}
      >
        Upload CSV Data Here!
      </FormLabel>
    </FormControl>
  );
};

export default DragDropFile;
