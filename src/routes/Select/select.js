import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  selectMethodList,
  applySelectMethod,
  getSelectMethodOptions,
} from "../../services/select";
import Directions from "../../components/Directions";
import Dropdown from "../../components/Dropdown";
import NextLink from "../../components/NextLink";

export const SelectPage = () => {
  const taskState = useSelector((state) => state.task.value);
  const dataState = useSelector((state) => state.data.value);
  const pageDirections = `For this ${taskState.name} task choose a data selection/partition method below, or provide your own`;
  const [method, setMethod] = useState({
    methodKey: "",
    methodDescription: "",
    selectedFile: null,
    submitted: false,
  });
  const [allMethods, setMethodList] = useState({
    methodsObj: {},
    options: [],
  });

  useEffect(() => {
    selectMethodList().then((methods) => {
      setMethodList({
        ...allMethods,
        methodsObj: methods,
        options: getSelectMethodOptions(methods),
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChangeMethodDropdown = (event) => {
    let key = event.target.value;
    let desc = key ? allMethods.methodsObj[key]["description"] : "";
    setMethod({
      ...method,
      methodKey: key,
      methodDescription: desc,
    });
  };

  const submitMethod = (event) => {
    event.preventDefault();
    applySelectMethod(dataState.dataId, method.methodKey).then((respData) => {
      if (method.methodKey) {
        setMethod({ ...method, submitted: true });
      }
    });
  };

  const onChangeUserMethodFile = (event) => {
    setMethod({ ...method, selectedFile: event.target.files[0] });
  };

  const submitUserMethodFile = (event) => {
    // Chech that the submitted program has the correct input output
    // flow for modifying the data chosen ealier
    event.preventDefault();
    setMethod({ ...method, submitted: true });
  };

  return (
    <div className="container">
      <div className="inner">
        <Directions text={pageDirections} />
        <Dropdown
          default="--choose a method--"
          label="Choose a selection method"
          options={allMethods.options}
          value={method.method}
          onChange={onChangeMethodDropdown}
        />
        <div
          style={{
            textAlign: "center",
          }}
        >
          <h5>{method.methodDescription}</h5>
          <button onClick={submitMethod} className="input-submit">
            Submit
          </button>

          <h5>OR</h5>

          <h3>Upload Method</h3>
          <h5>some directions</h5>
          <form className="form-container">
            <input type="file" accept=".py" onChange={onChangeUserMethodFile} />
            <button onClick={submitUserMethodFile} className="input-submit">
              Submit
            </button>
          </form>
        </div>
        <NextLink display={method.submitted} next={"/annotate"} text={"Next"} />
      </div>
    </div>
  );
};
