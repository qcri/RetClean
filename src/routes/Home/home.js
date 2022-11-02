import React from "react";

import Banner from "../../components/Banner";
import NextLink from "../../components/NextLink";

export const HomePage = () => {
  return (
    <div>
      <Banner />
      <NextLink next={"/data"} text={"Get Started"} />
    </div>
  );
};
