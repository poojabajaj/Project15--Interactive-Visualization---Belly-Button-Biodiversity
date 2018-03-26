//function optionChanged() 
//creating drop down
var $dataList = document.getElementById('selDataset');
url = "/names";
d3.json("/names", function(error, response) {
    if (error) return console.log(error);

    // console.log(response);
    var items = response;
    // console.log("checking")
    // console.log(items);
    for(var i = 0; i < items.length; i++) {
      var $option =  document.createElement("option");
      $option.setAttribute("value", items[i]);
      $option.innerHTML = items[i];

      $dataList.appendChild($option);
    }
})

//sample metadata as the page loads
var $metadata = document.getElementById('metadata');
url = "/metadata";
d3.json(url, function(error, response) {
    if (error) return console.log(error);

    updateMetadata(response)
})

//Loading Pie Chart as page loads
var pie = document.getElementById('pie');
sampleUrl = "/samples";
d3.json(sampleUrl, function(error, pieResponse) {
    if (error) return console.log(error);

    //console.log(response);
    //console.log("checking")
    createPiechart(pieResponse)
})

function pieHoverText(otuIDs){
  hoverText = [];
  d3.json("/otu", function(error, response) {
    if (error) return console.log(error);
    //console.log(otuIDs)
    for(i=0; i<10; i++){
      //console.log(otuIDs[i]+"---"+response[otuIDs[i]])
      hoverText.push(response[otuIDs[i]]);
  }
  //console.log(hoverText)   
})
return hoverText;
}

function createPiechart(response){
  pieValues = response[0]["sample_values"].slice(0, 10);
  pieLabels = response[0]["otu_ids"].slice(0, 10);

  hoverTxt= pieHoverText(pieLabels);
  //console.log(hoverTxt);

  var trace1 = {
      labels: pieLabels,
      values: pieValues,
      text: hoverTxt,
      type: 'pie',
    };
    var data = [trace1];
    var layout = {
      title: 'Pie Chart',
    };
    Plotly.newPlot(pie, data, layout);
}


//getting new data based on the selection in drop down and update pie chart, bubble plot and metadata
function optionChanged(optionValue) {
  //newUrl = "/samples?sampleid="+optionValue;
    newUrl = "/samples/"+optionValue;
  //console.log(newUrl);
  d3.json(newUrl, function(error, response) {
    if (error) return console.log(error);
    
    updatePiePlot(response);
    updateBubblePlot(response,true)
    })

    //for updating metadata based on selected sample in the dropdown
    //metaURL =  "/metadata?sampleid="+optionValue;
    metaURL =  "/metadata/"+optionValue;
    d3.json(metaURL, function(error, metaResponse) {
      if (error) return console.log(error);

      updateMetadata(metaResponse)
    })
  
}

//updating metadata with new sample values 
function updateMetadata(newdata) {

  //First removing any child that already exists  
  while ($metadata.hasChildNodes()) {   
    $metadata.removeChild(metadata.firstChild);
}
  var items = newdata;  
  for (var key in items){
    if(items.hasOwnProperty(key)) {
      var $md = document.createElement("ul");
      //console.log(key)                 
      //console.log(items[key]) 
      $md.innerHTML = key + items[key];
      $metadata.appendChild($md)

  }    
}
}

//updating pie plot with new sample values 
function updatePiePlot(myResponse) {
    //for Pie chart
    // console.log('myResponse')
    // console.log(myResponse)
    newValues = myResponse[0]["sample_values"].slice(0, 10);
    newLabels = myResponse[0]["otu_ids"].slice(0, 10);

    newhoverTxt= pieHoverText(newLabels);
    //console.log(newhoverTxt);

    var pie2 = document.getElementById('pie');
    Plotly.restyle(pie2, 'labels', [newLabels]);
    Plotly.restyle(pie2, 'values', [newValues]);
    Plotly.restyle(pie2, 'text', [newhoverTxt])
  }

//Loading bubble Chart as page loads
//@Theme
//var $BUBBLE = document.getElementById('bubblePlot');
urlSample = "/samples";
d3.json(urlSample, function(error, response) {
    if (error) return console.log(error);

updateBubblePlot(response,false)    
})


function updateBubblePlot(myResponse, shouldRestyle) {
    //bubble chart
    //@Theme
    var $BUBBLE = document.getElementById('bubblePlot');
  
    var xAxis = myResponse[0]["otu_ids"];
    var yAxis = myResponse[0]["sample_values"];
    var radii= myResponse[0]["sample_values"];
    var colors = myResponse[0]["otu_ids"];
    //const radii = [];
    //const colors = [];
    var UPPER_BOUND = myResponse[0]["sample_values"].length;

    for (var x = 0; x < UPPER_BOUND; x++) {
      //xAxis.push(x);
      //yAxis.push(x);
      // TODO: Change the value below to experiment
     // radii.push(Math.random() * x);
     // colors.push(`rgb(${x / 100},${x / 10},${x / 1000}`);
    }
    // @Objective
    const data = [{
      x: xAxis,
      y: yAxis,
      mode: "markers",
      marker: {
        color: colors,
        size: radii
      }
    }];
    // @Objective
    const layout = {
      title: "Bubble Chart",
      showlegend: false,
      height: 1000,
      width: 1000
    };

    if (shouldRestyle) {
      //var $BUBBLE = document.getElementById('bubblePlot');
      //console.log(xAxis)
      //console.log(yAxis)
      //console.log(radii)
      // console.log(colors)

      Plotly.restyle($BUBBLE, 'x', [xAxis]);
      Plotly.restyle($BUBBLE, 'y', [yAxis]);
      //Plotly.restyle($BUBBLE, 'marker.size', radii);
      //Plotly.restyle($BUBBLE, 'marker.color', colors);
      //Plotly.restyle($BUBBLE, 'UPPER_BOUND', UPPER_BOUND);
      //Plotly.restyle($BUBBLE, data)
    }
    else {
      Plotly.newPlot($BUBBLE, data, layout);
    }

}

