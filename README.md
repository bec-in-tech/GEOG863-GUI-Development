# GEOG863 - GUI Development in USA Wildfire Explorer Map

<b>Project Description:</b><br>

The "USA Wildfire Explorer" map offers an immersive and interactive experience for exploring and analyzing historical wildfire data across the United States from the years 2000 to 2018. Leveraging the power of the ArcGIS API for JavaScript, this project integrates advanced mapping functionalities, dynamic rendering, and user-friendly search and query features.

<b>Key Features:</b>

1. Dynamic 3D Visualization: Utilizing a SceneView, the project presents a dynamic and visually engaging 3D representation of wildfire incidents, allowing users to explore the landscape from different perspectives.

2. Interactive Home Button: The addition of a Home button provides users with a convenient way to reset the view to its initial position, ensuring a seamless navigation experience.

3. Class Breaks Renderer: A sophisticated Class Breaks Renderer categorizes wildfires based on their size in acres, employing a color-coded representation for better visualization and understanding.

4. Informative Popup Templates: Popup templates provide detailed information about each wildfire incident, including the incident name, state, fire year, acres burned, and the responsible land agency.

5. Layer List with Legend: The Layer List widget offers an organized view of available layers, enhanced with a legend to assist users in interpreting the color-coded representation of wildfire sizes.

6. Search and Query Functionality: Users are prompted to enter a specific fire year between 2000 and 2018. The application dynamically filters and displays wildfires for the chosen year, providing an insightful exploration of historical fire incidents.

7. Results Display and Spatial Query: The project includes a spatial query feature that dynamically updates the map extent and displays the count of wildfires for the selected year. The results are presented in a user-friendly manner, enhancing the overall experience.

8. List View of Wildfires: A list view is implemented to display wildfire incidents as interactive list items. Users can click on a specific wildfire in the list to view additional details through the popup.

9. Enhanced User Interface: The user interface is carefully designed, with widgets strategically placed for easy navigation. The integration of search, legend, and query functionalities contributes to an intuitive and informative user experience.

10. Detailed Graphics and Feature Selection: The project efficiently manages graphics, allowing users to click on a wildfire in the list to open an informative popup, providing a detailed overview of the selected incident.

Explore the "USA Wildfire Explorer" to gain valuable insights into historical wildfire patterns, sizes, and locations, fostering a deeper understanding of the impact of wildfires across the United States.

<div class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="zYmqJmz" data-user="rmu5072"  data-prefill='{"title":"Lesson 8 Assignment","tags":[],"scripts":[],"stylesheets":[]}'>
  <pre data-lang="html">&lt;html>
  &lt;head>
    &lt;meta charset="utf-8" />
    &lt;meta
      name="viewport"
      content="initial-scale=1,maximum-scale=1,user-scalable=no"
    />
    &lt;title>GEOG 863 - Lesson 8: GUI Development&lt;/title>

    &lt;link
      rel="stylesheet"
      href="https://js.arcgis.com/4.26/esri/themes/light/main.css"
    />
    &lt;link rel="stylesheet" href="" />
    &lt;script src="https://js.arcgis.com/4.26/">&lt;/script>
    &lt;script src="">&lt;/script>
  &lt;/head>

  &lt;body>
    &lt;div class="panel-container">
      &lt;div class="panel-side">
        &lt;h2>Selected Wildfires&lt;/h2>
        &lt;ul id="list_fires">
          &lt;li>Loading&hellip;&lt;/li>
        &lt;/ul>
      &lt;/div>
      
    &lt;div id="viewDiv">&lt;/div>
   
    &lt;div id="paneDiv" class="esri-widget">
    &lt;div>
      &lt;h2>USA Wildfire Map&lt;/h2>
      &lt;em>Search for a fire year between 2000 and 2018: &lt;/em>
      &lt;input type='text' id='txtName' placeholder='e.g., 2005'>&lt;/input>
      &lt;button class="esri-widget" id="btnQuery">Search Wildfires&lt;/button> &lt;br />&lt;br />
      &lt;span id='results'>&lt;/span>
    &lt;/div>
    &lt;/div> 
   
  &lt;/body>
&lt;/html></pre>
  <pre data-lang="css">html,
body,
#viewDiv {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  background-color: #d9d9d9;
}

#paneDiv {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  width: 350px; 
}

.panel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.panel-side {
  padding: 2px;
  box-sizing: border-box;
  width: 365px;
  height: 78%;
  position: absolute;
  bottom: 0;
  right: 0;
  top: auto; 
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: auto;
  z-index: 60;
}

.panel-side h2 {
  padding: 0 20px;
  margin: 20px 0;
}

.panel-side ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.panel-side li {
  padding: 5px 20px;
}

.panel-result {
  cursor: pointer;
  margin: 2px 0;
  background-color: rgba(0, 0, 0, 0.3);
}

.panel-result:hover,
.panel-result:focus {
  color: red;
  background-color: rgba(0, 0, 0, 0.75);
}
</pre>
  <pre data-lang="js">// Load required modules
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
  "esri/rest/support/Query"
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
  addClass(0, 20000, "#ffffb2", "&lt;20,000", fireRenderer);
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
view.when(function() {
    // Define a query that retrieves fire data
    const fireQuery = new Query({ 
      where: whereClause, // Where clause filters query results
      returnGeometry: true,
      outFields: ["incidentname", "state", "fireyear", "gisacres", "agency"], // Include this array of fields in the results
      orderByFields: ["incidentname"], // Use this array to sort the results
      outSpatialReference: view.map.basemap.baseLayers.items[0].spatialReference // The spatial reference of the query results
    }); 
    // Query the "fireLyr" Layer with the "fireQuery" then call the display results function with the query results
    return fireLyr.queryFeatures(fireQuery).then(displayResults);
  });  

// Empty array to store graphics
const graphics = [];

// Define the display results function to handle the query results
function displayResults(results) {
    const fragment = document.createDocumentFragment(); // Create a document fragment to store HTML list elements 
    
    
    results.features.forEach(function(fireLyr, index) {
      fireLyr.popupTemplate = template;
      
      graphics.push(fireLyr);  
      
      const attributes = fireLyr.attributes;
      const name = attributes.incidentname + " (" +
        attributes.fireyear + ")";
      
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

    /* I don't quite understand this section of the code - is this necessary if 
    the graphics array from above is empty?*/
    const result = resultId && graphics && graphics[parseInt(resultId,
      10)];

    if (result) {
      view.popup.open({
        features: [result],
        location: result.geometry.centroid
      });
    }
  }
});</pre></div>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
