// Load required modules
require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/Camera",
  "esri/widgets/Home",
  "esri/layers/FeatureLayer",
  "esri/renderers/ClassBreaksRenderer",
  "esri/symbols/PolygonSymbol3D",
  "esri/symbols/FillSymbol3DLayer",
  "esri/widgets/LayerList",
  "esri/rest/support/Query",
], (
  Map,
  SceneView,
  Camera,
  Home,
  FeatureLayer,
  ClassBreaksRenderer,
  PolygonSymbol3D,
  FillSymbol3DLayer,
  LayerList,
  Query
) => {
  const whereClause = "1=1";

  // Create a new Map instance
  const map = new Map({
    basemap: "dark-gray",
    ground: "world-elevation",
  });

  // Create a new SceneView instance
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: new Camera({
      position: [-100, 37, 5000000],
      heading: 0.00033600304965393925,
      tilt: 0.21974079866283297,
    }),
  });

  // Create a home button widget
  const homeBtn = new Home({
    view: view,
  });

  // Add the  home button widget to the top left corner of the map view
  view.ui.add(homeBtn, "top-left");

  // Define a renderer for the feature layer using Class Breaks
  const fireRenderer = new ClassBreaksRenderer({
    field: "gisacres",
    legendOptions: {
      title: "Acres Burned",
    },
  });

  // Define a function to add a class break to the fire renderer
  const addClass = function (min, max, clr, lbl, renderer) {
    renderer.addClassBreakInfo({
      minValue: min,
      maxValue: max,
      symbol: new PolygonSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: { color: clr },
            outline: {
              color: "black",
              size: 0.75,
            },
          }),
        ],
      }),
      label: lbl,
    });
  };

  // Add class breaks to the fire renderer for different ranges of fire size in acres
  addClass(0, 20000, "#ffffb2", "<20,000", fireRenderer);
  addClass(20000, 70000, "#fecc5c", "20,000 - 70,000", fireRenderer);
  addClass(70000, 180000, "#fd8d3c", "70,000 - 180,000", fireRenderer);
  addClass(180000, 360000, "#f03b20", "180,000 - 360,000", fireRenderer);
  addClass(360000, 670000, "#bd0026", "360,000 - 670,000", fireRenderer);

  // Define a popup template for the feature layer
  const template = {
    title: "{incidentname} Fire",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "state",
            label: "State",
          },
          {
            fieldName: "fireyear",
            label: "Fire Year",
          },
          {
            fieldName: "gisacres",
            label: "Acres Burned",
            format: {
              places: 0,
              digitSeparator: true,
            },
          },
          {
            fieldName: "agency",
            label: "Land Agency",
          },
        ],
      },
    ],
  };

  /*Create a new feature layer with the provided URL,  renderer, popup template, 
    and query*/
  const fireLyr = new FeatureLayer({
    portalItem: {
      id: "ef25d7e8c9f3499ba9e3d8e09606e488",
    },
    renderer: fireRenderer,
    popupTemplate: template,
  });

  // Add fire layer to the map display
  map.add(fireLyr);

  /*Add a legend instance to the panel of a ListItem 
    in a LayerList instance*/
  const layerList = new LayerList({
    view: view,
    listItemCreatedFunction: (event) => {
      const item = event.item;
      if (item.layer.type != "group") {
        // Customize the title of the layer list item
        item.title = item.layer.title + "Wildfires in the USA (2000 - 2018)";
        // Don't show legend twice
        item.panel = {
          content: "legend",
          open: true,
        };
      }
    },
  });

  // Add the legend widget to the bottom-left corner of the map view
  view.ui.add(layerList, "bottom-left");

  view.when(function () {
    // Add the paneDiv element to the top-right corner of the view
    view.ui.add("paneDiv", "top-right");
    // Add event listener to the btnQuery button - this calls for the getYear function when clicked
    document.getElementById("btnQuery").addEventListener("click", getYear);
  });

  // Define the getYear function
  function getYear() {
    const resultElem = document.getElementById("results"); // Get the element that displays the results
    resultElem.innerHTML = ""; // Clears the previous results from the element
    const txtName = document.getElementById("txtName"); // Get the value of the txtName input field
    const fireyear = txtName.value;
    fireLyr.definitionExpression = "fireyear = ' " + fireyear + "'"; // Set the definition expression for the fireLyr layer
    fireLyr.queryExtent().then(function (results) {
      view.goTo(results.extent); // Go to results
    });
    fireLyr.queryFeatureCount().then(function (count) {
      // Query the feature count of the fireLyr
      resultElem.innerHTML = "Found " + count + " wildfires in " + fireyear; // Display the results
    });
  }

  // Get the HTML element with ID "list_fires"
  const listNode = document.getElementById("list_fires");

  // Call the "when" method on the view object
  view.when(function () {
    // Define a query that retrieves fire data
    const fireQuery = new Query({
      where: whereClause, // Where clause filters query results
      returnGeometry: true,
      outFields: ["incidentname", "state", "fireyear", "gisacres", "agency"], // Include this array of fields in the results
      orderByFields: ["incidentname"], // Use this array to sort the results
      outSpatialReference:
        view.map.basemap.baseLayers.items[0].spatialReference, // The spatial reference of the query results
    });
    // Query the "fireLyr" Layer with the "fireQuery" then call the display results function with the query results
    return fireLyr.queryFeatures(fireQuery).then(displayResults);
  });

  // Empty array to store graphics
  const graphics = [];

  // Define the display results function to handle the query results
  function displayResults(results) {
    const fragment = document.createDocumentFragment(); // Create a document fragment to store HTML list elements

    results.features.forEach(function (fireLyr, index) {
      fireLyr.popupTemplate = template;

      graphics.push(fireLyr);

      const attributes = fireLyr.attributes;
      const name = attributes.incidentname + " (" + attributes.fireyear + ")";

      const li = document.createElement("li");
      li.classList.add("panel-result");
      li.tabIndex = 0;
      li.setAttribute("data-result-id", index);
      li.textContent = name;

      fragment.appendChild(li);
    });

    listNode.innerHTML = ""; // Clear the HTML element
    listNode.appendChild(fragment); // Add document fragment containing the list items

    /* I'm not sure if I did this code block correctly; 
   I used the same inputs from the addClass function from above*/
    const selLayer = new FeatureLayer({
      fields: fireLyr.fields,
      objectIdField: "incidentname",
      renderer: {
        type: "class-breaks",
        field: "gisacres",
        symbol: new PolygonSymbol3D({
          symbolLayers: [
            new FillSymbol3DLayer({
              material: { color: clr },
              outline: {
                color: "black",
                size: 0.75,
              },
            }),
          ],
        }),
      },
    });
    map.add(selLayer);
  }

  // Add a click event listener to the HTML list
  listNode.addEventListener("click", onListClickHandler);

  function onListClickHandler(event) {
    const target = event.target;
    const resultId = target.getAttribute("data-result-id");

    /* I don't quite understand this section of the code - is this necessary in
    my case if the graphics array from above is empty?*/
    const result = resultId && graphics && graphics[parseInt(resultId, 10)];

    if (result) {
      view.popup.open({
        features: [result],
        location: result.geometry.centroid,
      });
    }
  }
});
