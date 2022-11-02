import React from "react";

import { downloadData } from "../../services/download";
import Directions from "../../components/Directions";
import NextLink from "../../components/NextLink";

export const DownloadPage = () => {
  const pageDirections = `The annotated data is ready to download.`;
  const download = (event) => {
    downloadData("annotated_data.csv");
  };

  return (
    <div className="container">
      <div className="inner">
        <Directions text={pageDirections} />
        <div
          style={{
            textAlign: "center",
          }}
        >
          <button onClick={download}>Download</button>
        </div>
        <NextLink display={true} next={"/task"} text={"Go Again"} />
      </div>
    </div>
  );
};
