/**
 * Example of using MaterialTable and getting hold of the filtered data rows in TWO different ways (useEffect, and MaterialTable.onSearchChange).
 * filtered data is found in MaterialTable.state.data (and.renderData)
 *
 * Also some examples of how to render actions (buttons),
 * conditional and 'standard'
 * And a simple details pane when expanding the row.
 * And how to use SvgIcon from @material-ui/icons fo raction buttons
 *
 * This example shows apps to install and uninstall on a computer
 *
 * Enjoy =)
 * //Jimi
 * https://www.linkedin.com/in/jimi-friis-b729155/
 * https://github.com/JimiSweden
 */

import React, { useRef, useEffect, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";

import {
  AddCircleOutline,
  RemoveCircleOutline,
  AddToQueue,
  RemoveFromQueue,
  ExpandMore,
  ExpandLess,
} from "@material-ui/icons";

/**
 * example of how to use detailPanel.
 */
function AppDetailsPanel({ app }) {
  return (
    <div
      style={{
        fontSize: "1em",
        textAlign: "center",
        color: "white",
        backgroundColor: "#43A047",
      }}
    >
      {
        <div>
          Name: {app.name}
          <div>Here we could show more details about the app</div>
        </div>
      }
    </div>
  );
}

/** some dummy data made available for you to keep data in the same file */
const allAppsAvalableDummy = [
  {
    name: "Chrome",
    operatingSystem: "Windows",
    manufacturer: {
      brand: "Google",
    },
    isInstalled: true,
  },
  {
    name: "VS Code",
    operatingSystem: "Windows",
    manufacturer: {
      brand: "Microsoft",
    },
    isInstalled: false,
  },
  {
    name: "Chrome",
    operatingSystem: "Mac",
    manufacturer: {
      brand: "Google",
    },
    isInstalled: true,
  },
  {
    name: "VS Code",
    operatingSystem: "Mac",
    manufacturer: {
      brand: "Microsoft",
    },
    isInstalled: false,
  },
];

/**
 *  Your "entry point"
 */
function MaterialTableGettingHoldOfRenderData({ appsAvailable, loading }) {
  /** this is just to show some dummy data without you having to load a full example */
  appsAvailable = allAppsAvalableDummy;

  //to get hold of the filtered data set. living in tableRef.current.state.data, i.e. MaterialTable.state.data
  const tableRef = useRef(MaterialTable);

  /** useState to hold local state of the current data displayed in the table.
   * use Context to shared data with other components
   *
   */
  const [filteredDataRowsUsingUseEffect, setFilteredDataRowsUsingUseEffect] =
    useState([]);

  /** OPTION 1 - useEffect
   * Note: when listening on state (of MaterialTable) to change it is actually updated twice on initial render,
   * what I can see is that
   * - the property "width" is 0 on first update, and on the second has a value from the rendered DOM.
   * the "state.data" array is the same in both "renders"
   * This might be something to consider with a "first render" check.
   *
   *
   * Since I want the initial listing (or at least data from it) in a shared Context I will use this approach,
   *  - as the material-table can  be configured with default filters etc it makes it easier to implement that
   * -- without having dependencies breaking for the view depending on the filtered data
   *
   */
  useEffect(() => {
    // debugger; //to give a hint of the extra "stops" you get when going this route

    /**update the local useState or a Context here if sharing the filtered data
     * note: you might need to assert the Context is not updated twice, I havn't validated that yet.
     */
    console.log(
      `tableRef.current.state changed. search text : "${tableRef.current.state.searchText}" - data : `,
      tableRef.current.state.data
    );
    setFilteredDataRowsUsingUseEffect(tableRef.current.state.data);

    /** listening on the 'state.data' requires the conditonal AND parameter since 'state' will be undefined initialy ,
     * this also makes sure we don't need to check if 'state' is available in the locals
     **/
  }, [tableRef.current.state && tableRef.current.state.data]);

  useEffect(() => {
    console.log(
      "filteredDataRows was updated - Using useEffect : ",
      filteredDataRowsUsingUseEffect
    );
  }, [filteredDataRowsUsingUseEffect]);

  /**  OPTION 2 - MaterialTable.onSearchChange callback
   * same as the useEffect example above, But instead of useEffect..
   *  hooking into the MaterialTable.onSearchChange callback
   * One benifit from this is you don't get the extra "clutter" during the rendering phase
   * and less thinks to check/validate/assert
   *
   */
  const [
    filteredDataRowsUsingOnSearchChange,
    setFilteredDataRowsUsingOnSearchChange,
  ] = useState([]);

  //just for logging the update and show an example.. you might want to have a chain reaction here
  useEffect(() => {
    console.log(
      "filteredDataRows was updated - using materialTable.onSearchChange : ",
      filteredDataRowsUsingOnSearchChange
    );
  }, [filteredDataRowsUsingOnSearchChange]);

  /** you don't need the search text, but it's available as the default input in your callback. */
  const handleSearchChange = (searchText) => {
    console.log(
      `handleSearchChange. search text : "${searchText}" - data : `,
      tableRef.current.state.data
    );
    //no need to assert 'state.data' prop exists here; if not available something else probably is broken.
    // debugger;
    setFilteredDataRowsUsingOnSearchChange(tableRef.current.state.data);
  };

  /** you can also call the handler with the state data directly
   *  and like here deconstruct the props you want, or only pass the state.data if that is all you need
   */
  const handleSearchChangeDirect = ({ data, searchText }) => {
    console.log(
      `handleSearchChangeDirect : search text : "${searchText}" - data : `,
      data
    );
    //no need to assert 'state.data' prop exists here; if not available something else probably is broken.
    // debugger;
    setFilteredDataRowsUsingOnSearchChange(data);
  };

  /** render stuff below
   * */

  /**
   * Note: material-table data, appsAvailable, must be array of objects which has fields defined in columns.
   *
   * when using redux (as I do in this app) this mapping is also needed to make the data extensible by material-table /utils/data-manager
   *  (otherwise it breaks due to redux storage, probably the same if using Context)
   * - not sure how this will affect performance with larger data sets.
   * - not sure how this will work with editing.. but if using a separate edit component that might not be an issue
   * - look at https://material-table.com/#/docs/features/editable
   */
  let appsAvailableTableData = appsAvailable.map((app) => ({
    /**
     * add other data for the row here,
     * f ex if you want to add data into columns from nested objects
     *  (material-tables work with flat structure)
     * f ex if you have nested objects/json structure like this
     */
    brand: app.manufacturer.brand,
    /**spread the rest of the props */
    ...app,
  }));

  return (
    <MaterialTable
      //needed to get hold of state.data
      tableRef={tableRef}
      /** onSearchChange is triggered on search text changes;
       * filtered data will be ready in tableRef.current.state.data,
       * by default searchText is passed into the function passed here(i.e. handleSearchChange)
       * */
      onSearchChange={handleSearchChange}
      /** this example shows how you can pass the referred state object directly
       * my preference is to use the above, as it is cleaner , i.e. keeps all logic in one place.
       */
      //   onSearchChange={() => handleSearchChangeDirect(tableRef.current.state)}
      //show loading spinner
      isLoading={loading}
      //enable grouping by columns
      options={{
        grouping: true,
      }}
      /**note: data in array format  */
      data={appsAvailableTableData}
      title={`Find apps to install on your machine`}
      columns={[
        { title: "Name", field: "name" },
        { title: "Brand", field: "brand" },
        { title: "OS", field: "operatingSystem" },
      ]}
      /** details in expanded mode */
      detailPanel={[
        {
          icon: () => <ExpandMore />,
          openIcon: () => <ExpandLess />,
          tooltip: "Show details",
          render: (rowData) => <AppDetailsPanel app={rowData} />,
        },
      ]}
      /** example of override Toolbar to set background style */
      components={{
        Toolbar: (props) => {
          return (
            <div style={{ backgroundColor: "#e8eaf5" }}>
              <MTableToolbar {...props} />
            </div>
          );
        },
      }}
      actions={[
        {
          icon: () => <AddToQueue />,
          tooltip: "install app",
          //replace the alert with something useful ;)
          onClick: (event, rowData) =>
            alert("You are installing" + rowData.name),
        },
        {
          icon: () => <RemoveFromQueue />,
          tooltip: "uninstall app",
          //replace the alert with something useful ;)
          onClick: (event, rowData) =>
            alert("You are uninstalling " + rowData.name),
        },
        //a conditional example
        (rowData) => ({
          icon: rowData.isInstalled
            ? () => <RemoveCircleOutline />
            : () => <AddCircleOutline />,
          tooltip: rowData.isInstalled ? "uninstall" : "install" + "app",
          onClick: (event, rowData) => alert("You want to ... " + rowData.name),
          disabled: rowData.someProp === true,
        }),
      ]}
    />
  );
}

export default MaterialTableGettingHoldOfRenderData;
