var userDataArray = [];
var userTweetDataArray = [];
var streamGraphWidth = 0.6;
var container, svg, x, y, divTip, color, word_cloud, divTip_Area, keys;
const margin = {top: 20, right: 30, bottom: 30, left: 60};

// Scatterplot dimensions
const scatterplot_margin = {top: 10, right: 30, bottom: 30, left: 60}
var scatterplot_width = 460 - scatterplot_margin.left - scatterplot_margin.right;
var scatterplot_height = 400 - scatterplot_margin.top - scatterplot_margin.bottom;
var scatterplot_svg;
var scatterplot_tooltip;
var pie_data;

var svg_ChartA, xScale_ChartA, yScale_ChartA, xAxis_ChartA, yAxis_ChartA;

// var users_data
var users_segments = ["POTUS", "chrisbryanASU","elonmusk","h3h3productions","realDonaldTrump","MrBeast","MKBHD","hasanthehun","GretaThunberg","drewisgooden"]
var areaChartObject = {}, pieChartData = {}, lineChartDateArray= [];
var user = "POTUS";
var test;
document.addEventListener('DOMContentLoaded', function () {

  keys = ["anger","fear","anticipation","trust","suprise","sadness","joy","disgust"];
    
    Promise.all([d3.csv('model/tweet_dataset/POTUS_segment.csv'),
                d3.csv('model/tweet_dataset/chrisbryanASU_segment.csv'),
                d3.csv('model/tweet_dataset/elonmusk_segment.csv'),
                d3.csv('model/tweet_dataset/h3h3productions_segment.csv'),
                d3.csv('model/tweet_dataset/realDonaldTrump_segment.csv'),
                d3.csv('model/tweet_dataset/MrBeast_segment.csv'),
                d3.csv('model/tweet_dataset/MKBHD_segment.csv'),
                d3.csv('model/tweet_dataset/hasanthehun_segment.csv'),
                d3.csv('model/tweet_dataset/GretaThunberg_segment.csv'),
                d3.csv('model/tweet_dataset/drewisgooden_segment.csv'),
                d3.csv('model/tweet_dataset/POTUS.csv'),
                d3.csv('model/tweet_dataset/chrisbryanASU.csv'),
                d3.csv('model/tweet_dataset/elonmusk.csv'),
                d3.csv('model/tweet_dataset/h3h3productions.csv'),
                d3.csv('model/tweet_dataset/realDonaldTrump.csv'),
                d3.csv('model/tweet_dataset/MrBeast.csv'),
                d3.csv('model/tweet_dataset/MKBHD.csv'),
                d3.csv('model/tweet_dataset/hasanthehun.csv'),
                d3.csv('model/tweet_dataset/GretaThunberg.csv'),
                d3.csv('model/tweet_dataset/drewisgooden.csv')])
         .then(function (values) {

          /** Push user data into an array */
          for(let x = 0; x < 10; x++){
            userDataArray.push(values[x]);
          }

          /** Push user tweet data into an array */
          for(let x = 10; x < 20; x++){
            userTweetDataArray.push(values[x]);
          }

          test = values[0];

          /** Data aggregation for area chart creation */
          for(let k = 10; k < 20; k++){
            var areaChartData = [];
            var file_data = values[k];
            var map = new Map();
            for(let i = 0; i < 8; i++){
              map.set(keys[i], new Map());
            }
            for(let i = 0; i < file_data.length; i++)
            {
              var temp = JSON.parse(file_data[i].Words_VAD_Emotion);
              const section = parseInt(file_data[i].Segment_ID);
              if(areaChartData.length == section){
                areaChartData.push({"map" : new Map(), "count" : 0, "date": new Date(file_data[i]["DateTime"].split(" ")[0]), Segment_ID : section});
              }
              var object = areaChartData[section];
              Object.entries(temp).forEach((element) => {
                  if(object.map.has(element[0])){
                    object.map.set(element[0], object.map.get(element[0]) + 1);
                  }else{
                    object.map.set(element[0], 1);
                  }
                  object.count++
                  var emotionArray = element[1].emotion;
                  for(let k = 0; k < emotionArray.length; k++){
                    if(emotionArray[k] == 1){
                      var emotionMap = map.get(keys[k]);
                      if(emotionMap.has(element[0])){
                        emotionMap.set(element[0], emotionMap.get(element[0]) + 1);
                      }else{
                        emotionMap.set(element[0], 1);
                      }
                    }
                  }
              });
            }
            areaChartObject[users_segments[k - 10]] = areaChartData;
            pieChartData[users_segments[k - 10]] = map;
          }

          console.log("Load user data from the csv files");

          divTip_Area = d3.select("body").append("div")
            .attr("class", "tooltip_area")
            .style("border", "1px solid white")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("opacity", 0)

          // Scatterplot tooltip creation
          scatterplot_tooltip = d3.select('body').append('div')
            .attr('class', 'scatterplot_tooltip')
            .style('opacity', 0);

        
          
          
          color = d3.scaleOrdinal().domain(keys).range(['#eb4034','#3bb347','#fa7916','#07f566','#07f5f1','#86b5cf','#f7f707','#8b07f7']);

          drawLineChart();
          drawStreamGraph(true, null);
          //aggregatedPieChart();
            

            }); 
        });

function updateSelectedUser(){
  user=document.getElementById("user").value;
  console.log("selected user "+user);
  drawLineChart();
  drawStreamGraph(true, null);
}

function getSelectedUserData(){
  var u1Data=[];
  selected_user=document.getElementById("user").value;
  const userIndex = users_segments.indexOf(selected_user);
  u1Data = userDataArray[userIndex];
  // if (user==="POTUS"){
  //   u1Data=user1Data;
  // }
  // else if (user==="chrisbryanASU"){
  //   u1Data=user2Data;
  // }
  // else if (user==="elonmusk"){
  //   u1Data=user3Data;
  // }
  // else if (user==="h3h3productions"){
  //   u1Data=user4Data;
  // }

  var arrObj=[];
  for (let i = 0; i < u1Data.length; i++) {
    if(Object.keys(JSON.parse(u1Data[i]['Segment_VAD_Emotion'])).length!=0){

        arrObj.push({"date":new Date(u1Data[i]["DateTime"].split(" ")[0]),
        "valence":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).valence,
        "arousal":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).arousal,
        "dominance":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).dominance,
        "anger":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[0],
        "fear":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[1],
        "anticipation":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[2],
        "trust":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[3],
        "suprise":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[4],  
        "sadness":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[5],
        "joy":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[6],
        "disgust":JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion[7],
        "total_sum_emotions": JSON.parse(u1Data[i]['Segment_VAD_Emotion']).emotion.reduce((partialSum, a) => partialSum + a, 0),
        "circle_packing_data":JSON.parse(u1Data[i]["Emotion_VAD"])             
        });
    }
  };


  return arrObj
}

function getSelectedUserTweetData(){
  var u1Data=[];
  selected_user=document.getElementById("user").value;
  const userIndex = users_segments.indexOf(selected_user);
  u1Data = userTweetDataArray[userIndex];
  return u1Data;
}

function loadSegmentTweets(segment_id){
  var segment_data = getSelectedUserTweetData().filter(tweet => tweet.Segment_ID === segment_id.toString());
  console.log(segment_data);
  var tweet_list = document.getElementById("tweetList");
  tweet_list.innerHTML="";

  for(var i=0; i<segment_data.length; i++){
    var words_vad_emotion = JSON.parse(segment_data[i].Words_VAD_Emotion);

    var words = Object.keys(words_vad_emotion).filter(word => words_vad_emotion[word]['emotion'].toString() != '0,0,0,0,0,0,0,0');
    console.log(words);
    var tweet = document.createElement("li");

    tweet.innerHTML = "<a>"+highlightEmotionalWordsInTweet(segment_data[i]['Text'], words)+"</a>";
    tweet_list.appendChild(tweet);
  }

}

function highlightEmotionalWordsInTweet(text,words){
  for(var i=0; i<words.length; i++){
    text = text.replaceAll(words[i], "<b>"+words[i]+"</b>");
  }
  return text;
}

function drawScatterplot(segment_id){
  d3.select("#scatterplot_svg").selectAll("*").remove();
  scatterplot_svg = d3.select("#scatterplot_svg")
      .attr("width", scatterplot_width + scatterplot_margin.left + scatterplot_margin.right)
      .attr("height", scatterplot_height + scatterplot_margin.top + scatterplot_margin.bottom)
      .append("g")
      .attr("transform", "translate(" + scatterplot_margin.left + "," + scatterplot_margin.top + ")");

  // console.log(getSelectedUserTweetData());
  var scatterplot_data = getSelectedUserTweetData().filter(tweet => tweet.Segment_ID === segment_id.toString());
  // let scatterplot_data = getSelectedUserTweetData();
  
  var scatterplot_pie = d3.pie().value(function(d) {return d[1];});

  pie_data = [];
  for (var i = 0; i < scatterplot_data.length; i++) {
      for (const [key, value] of Object.entries(JSON.parse(scatterplot_data[i].Words_VAD_Emotion))) {
          temp = scatterplot_pie(Object.entries(Object.assign({}, value.emotion)));
          temp = temp.filter(o => o.startAngle != o.endAngle);
          temp.forEach(function(d) {
              d.key = key;
              d.valence = value.valence;
              d.arousal = value.arousal;
              d.dominance = value.dominance;
              d.emotion = value.emotion;
          });
          pie_data = pie_data.concat(temp);
          // console.log(pie_data);
      }
  }

  // Add X axis
  var scatterplot_x = d3.scaleLinear()
      .domain([0, 1])
      .range([ 0, scatterplot_width ]);
  
  scatterplot_svg.append("g")
      .attr("transform", "translate(0," + scatterplot_height/2 + ")")
      .call(d3.axisBottom(scatterplot_x));

  // Add Y axis
  var scatterplot_y = d3.scaleLinear()
      .domain([0, 1])
      .range([ scatterplot_height, 0]);
  
  scatterplot_svg.append("g")
      .call(d3.axisLeft(scatterplot_y))
      .attr("transform", "translate(" + scatterplot_width/2 + ", 0)");

  // X axis label:
  scatterplot_svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", scatterplot_width)
      .attr("y", scatterplot_height/2 + scatterplot_margin.top + 20)
      .text("Arousal");

  // Y axis label:
  scatterplot_svg.append("text")
      .attr("text-anchor", "end")
      .attr("y", scatterplot_margin.top - 5)
      .attr("x", scatterplot_width/2 - 40)
      .text("Valence")


// Draw data
// const scatterplot_color = d3.scaleOrdinal(d3.schemeSet2); //temp color scale
scatterplot_svg.selectAll('.pie')
  .data(pie_data)
  .join('path')
  .attr("class", "pie")
  .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(function(d) {return Math.max(d.dominance*(Math.min(scatterplot_width, scatterplot_height) / 15 - 10), 6);})
  )
  .attr('fill', function(d) { return color(keys[parseInt(d.data[0])])}) // scatterplot_color(d.data[0]);
  .attr('transform', function(d) { return 'translate(' + scatterplot_x(d.arousal) + ',' + scatterplot_y(d.valence) + ')';})
  .on("click", function(d, i) {
      if (d3.select(this).style("stroke-opacity") < 1) {
        scatterplot_svg.selectAll('.pie').style("stroke-opacity", 0);
        scatterplot_svg.selectAll('.pie').each(function(d) {
              if(d.valence == i.valence && d.arousal == i.arousal) {
                  d3.select(this).style("stroke-opacity", 1);
              }
          });
      }
      else { scatterplot_svg.selectAll('.pie').style("stroke-opacity", 0); }
  })
  .on("mouseover", function(d, i) {
      if (d3.select(this).style("stroke-opacity") == 0) {
        scatterplot_svg.selectAll('.pie').each(function(d) {
              if(d.valence == i.valence && d.arousal == i.arousal) {
                  d3.select(this).style("stroke-opacity", 0.99);
              }
          });
      }
      var emotionText = "";
      for (var j = 0; j < i.emotion.length; j++) {
          if (i.emotion[j] == 1) {
              emotionText += keys[j] + " ";
          }
      }
      const text = "<i>" + i.key + "</i><br><b>valence</b> " + i.valence + "<br><b>arousal</b> " + i.arousal + "<br><b>dominance</b> " + i.dominance + "<br><b>emotion</b> " + emotionText;
      scatterplot_tooltip.html(text)
          .style('opacity', .9)
          .style('left', (d.pageX+20) + 'px')
          .style('top', (d.pageY+20) + 'px');
  })
  .on("mousemove", function(d) {
    scatterplot_tooltip.style('top', d.pageY+20+'px')
          .style('left',d.pageX+20+'px');
  })
  .on("mouseout", function(d,i) {
      if (d3.select(this).style("stroke-opacity") == 0.99) {
        scatterplot_svg.selectAll('.pie').each(function(d) {
              if(d.valence == i.valence && d.arousal == i.arousal) {
                  d3.select(this).style("stroke-opacity", 0);
              }
          });
      }
      scatterplot_tooltip.html("")
          .style('opacity', 0)
          .style('left', -scatterplot_margin.left + 'px')
          .style('top', -scatterplot_margin.top + 'px');
  })
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("stroke-opacity", 0)
  .style("opacity", 0.7);


    
}


function drawStreamGraph(loadLineChart = false, dateRange=null){
  
  d3.select("#streamGraph").selectAll("*").remove();
  
  // arrayOfObjects 
  var arrObj = getSelectedUserData();

    const height = 500 - margin.top - margin.bottom;
    const width = 1400- margin.left - margin.right;

    svg = d3.select("#streamGraph")
          .attr("height", height + margin.top + margin.bottom)
          .attr("width", width + margin.left + margin.right)
          .append("g")
          .attr("transform",`translate(${margin.left}, ${margin.top})`);

    var data=arrObj;
    // console.log(data);


    var dateArray = [...new Set(arrObj.map(d => d['date']))];
    var ipStartDate=document.getElementById("startDate").value;
    var ipEndDate=document.getElementById("endDate").value;
    //console.log(ipEndDate);
    if (ipStartDate.length!=0 && ipEndDate.length!=0){
      var minDate=new Date(ipStartDate);
      var maxDate= new Date(ipEndDate);

    } else{
    var minDate=d3.min(dateArray);
    var maxDate=d3.max(dateArray);
    // console.log(minDate)
    // console.log(maxDate)
    };
    // console.log(minDate);
    // console.log(maxDate);

    // update dataArray based on max and min dates
    var updatedDateArray=[]
    for (let i = 0; i < dateArray.length; i++) {
      if (dateArray[i]>=minDate && dateArray[i]<=maxDate){
        updatedDateArray.push(dateArray[i])
      };
    };
    //console.log(updatedDateArray);
    var xAxisMinDate=d3.min(updatedDateArray);
    var xAxisMaxDate=d3.max(updatedDateArray);

    // update dataArray based on max and min dates
    var updatedData=[]
    for (let i = 0; i < data.length; i++) {
      if (data[i]["date"]>=minDate && data[i]["date"]<=maxDate){
        updatedData.push(data[i])
      };
    };

    if (dateRange){
      xAxisMinDate = dateRange[0];
      xAxisMaxDate = dateRange[1];
    }

    // X axis
    x = d3.scaleTime()
      .domain([xAxisMinDate, xAxisMaxDate])
      // .domain(d3.extent(updatedDateArray, function(d) { return d; }))
      .range([ 0, width ]);


      var tickArray = updatedDateArray.filter(function(v, i) { 
        return i % 3 === 0;
      
      });

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")).tickValues(tickArray));
        
        

    // Y axis Streamgraph
    y = d3.scaleLinear().domain([0,1]).range([ height,0]);
    svg.append("g").call(d3.axisLeft(y));

    // Y axis Area Chart
    const y_Area = d3.scaleLinear().domain([0,150]).range([ height,0]);
    svg.append("g").attr("class","yAxisArea").attr("transform", "translate(" + width + ", 0)").call(d3.axisRight(y_Area));
    d3.select(".yAxisArea").style("visibility", "hidden");
  
    updatedData.forEach((obj)=>{
      var total = obj.anger + obj.fear + obj.anticipation + obj.trust + obj.suprise + obj.sadness + obj.joy + obj.disgust;
      for (const [key, value] of Object.entries(obj)) {
        if(keys.includes(key)){
          obj[key] = ((obj[key] * 0.4) / total);
        }
      }
    })
  
    /* Plot the area chart */
    var area = d3.area()
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y_Area(d.count ); }); // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  
    let areaData = [];
    const userAreaData = areaChartObject[user];
    for(let i = 0 , l = userAreaData.length; i < l-1; i=i+1) {
      let tempArr = [];
      tempArr.push(userAreaData[i]);
      tempArr.push(userAreaData[i+1]);
      areaData.push(tempArr);
    }

    areaData.forEach((ele) => {
      svg.append("path")
      .datum(ele)
      .attr("class", "area")
      .on("mouseover", function(d,i) {
            var tempData = [];
            var obj = {};
            obj['date'] = i[0].date;
            obj['val'] = 0;
            tempData.push(Object.assign({},obj));

            var area_wc_data = [];
            const max_val = Math.max(...i[1].map.values());
            for (const [key, value] of i[1].map) {
              if(max_val >= 35){
                area_wc_data.push({word: key, freq: value * (max_val / 35)});
              }else{
                area_wc_data.push({word: key, freq: value * (35 / max_val)});
              }
            }

            var red_lines = svg.selectAll(".red_line")
              .data(tempData);
              
            red_lines.enter().append('line')
              .attr("class", "red_lines")
              .merge(red_lines)
              .attr("stroke", "red")
              .attr('stroke-width', 1.5)
              .attr("x1", (d) => { return x(d.date); })
              .attr("x2", (d) => { return x(d.date); })
              .attr("y1", y(0))
              .attr("y2", (d) => { y(1); })

              d3.select(this).style('opacity', 1);
              d3.select(".yAxisArea").style("visibility", "visible");
              divTip_Area.style("opacity", .9);
              divTip_Area.style("left", (d.pageX) + "px").style("top", (d.pageY) + "px");
              wordChart_AreaGraph(area_wc_data);
  
      })
      .on("mouseout", function(d) {
              d3.select(this).style('opacity', 0.5);
              d3.select(".yAxisArea").style("visibility", "hidden");
              d3.select(".tooltip_area").style('opacity', 0); // Hide tooltip when hovered
              d3.select(".tooltip_area").selectAll("*").remove();
              d3.select(".red_lines").remove();
              d3.selectAll("#word_cloud_chart").remove();
      })
      .on("click", function(d,i) {
        // console.log(i[0].Segment_ID);
        drawScatterplot(i[0].Segment_ID);
        loadSegmentTweets(i[0].Segment_ID)
      })
      .attr('fill', 'rgba(70, 130, 180)')
      .attr("opacity", 0.5)
      .attr("d", area);
    });

    /* stack Data */
    const stackedData = d3.stack()
      //.offset(d3.stackOffsetSilhouette)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetWiggle)
      .keys(keys)(updatedData);

    var area = d3.area()
      .x(function(d) { return x(d.data.date); })
      .y0(function(d) { return y(d[0] + 0.2); })
      .y1(function(d) { return y(d[1] + 0.2); })
      .curve(d3.curveBasis);
        
    const tooltipStreamgraph = d3.select("body")
        .append("div")
        .attr("class","streamGraphTooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("border-radius", "6px")
        .style("background", "#FFFF8A")
        .style("color", "black")
        .style("outline", "thin solid black")
        .style("padding", "5px")
        .style("font-style","italic")
        .text("emotion");

    svg.selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .attr('class',"stack_layers")
    .on("mouseover", function(d,i) {
      tooltipStreamgraph.html(`Data: ${d}`).style("visibility", "visible").text(i.key);
      d3.selectAll(".stack_layers").style('opacity',0.4);
      d3.select(this).style('opacity',1);

    })
    .on("mousemove", function(d,i){
      tooltipStreamgraph.style("top", (d.pageY-5)+"px").style("left",(d.pageX+5+"px"));
    })
    .on("mouseout", function(d) {
      tooltipStreamgraph.html(``).style("visibility", "hidden");
      d3.selectAll(".stack_layers").style('opacity', 0.8);
    })
    .attr("transform", function(d) { return "translate(0," + -90 + ")"; })
    .style("fill", function(d) { return color(d.key); })
    .attr("d", area)
    .attr("opacity", 0.8)
  

    var circles = svg.selectAll("._circle")
                .data(updatedData);

    circles.enter().append('circle')
        .attr('id', function(d){ return 'circle' })
        .attr('class',"cnty_circles")
        .merge(circles)
        .attr("cx", (d) => {return x(d.date);})
        .attr("cy", (d) => y(d.valence) )
        .attr("r", 10)
        .on("mouseover", function(d,i) {
          circle_packing(i.date, i.valence, i)   
        })
        .style("stroke", "black")
        .style("stroke-width", 1.5)
        .attr("fill", "grey")
    
    var rext = svg.selectAll(".rect").append("re").data(updatedData);

    // Add the path using this helper function
    rext.enter().append('rect')
        .attr('id', function(d){ ; return 'rectangle' })
        .attr('class',"cnty_rects")
        .merge(rext)
        .attr("transform", "translate(" + (-9) + ", 0)")
        .attr("x", (d) => {return x(d.date);})
        .attr("y", (d) => y(d.valence) )
        .attr('stroke', 'white')
        .attr('fill', 'white')
        .attr('marker-end','url(#arrow)')
        .attr('width', 18)
        .attr('height', 1)
    
    /** Draw aggregated pie chart after Stream Graph creation */
    aggregatedPieChart();

};

// function drawLineChart(dateArray, userData, dataSetName){
function drawLineChart(){
  var userData = getSelectedUserData();
  var dateArray = [...new Set(userData.map(d => d['date']))];
  var dataSetName = user;

  lineChartDateArray= dateArray;

  d3.select("#lineGraph").selectAll("*").remove();
  const l_height = 100 - margin.bottom;
  const l_width = 1400 - margin.left - margin.right;

  /* SVG Element for the line graph */
  svg_ChartA = d3.select("#lineGraph")
                .attr("height", l_height)
                .attr("width", l_width + margin.left + margin.right)
                .append("g")
                .attr("transform",`translate(${margin.left}, ${margin.top})`);

  xScale_ChartA = d3.scaleTime().domain([d3.min(dateArray), d3.max(dateArray)]).range([0, l_width]);
  //var tickArray = dateArray.filter(function(v, i) { return i % 3 === 0; });

  svg_ChartA.append("g").attr("transform", `translate(0, ${l_height - margin.top * 2})`)
      .call(d3.axisBottom(xScale_ChartA).tickFormat(d3.timeFormat("%Y-%m-%d")).tickValues(dateArray));
      
  yScale_ChartA = d3.scaleLinear().domain([0,1]).range([(l_height - margin.top * 2), 0]);
  svg_ChartA.append("g").attr("class","yAxis_LineChart").call(d3.axisLeft(yScale_ChartA));
  d3.select(".yAxis_LineChart").style("visibility", "hidden");

  /* Add line into SVG */
  var line = d3.line()
              .x(function(d) { return xScale_ChartA(d.date);})
              .y(function(d) { return yScale_ChartA(d.valence);})

  var dataArr = [["key", userData]];

  svg_ChartA.selectAll(".line")
      .data(dataArr)
      .join("path")
      .attr('class',"lines")
      .attr("fill", "none")
      .attr("stroke-dashoffset", 600)
      .attr('opacity', 1)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("d", d => { return line(d[1])});
  
  var pcircles = svg_ChartA.selectAll(".pos_circles")
      .data(userData)
      
  pcircles.enter().append('circle')
      .attr("class", "circles")
      .merge(pcircles)
      .attr("cx", (d) => { return xScale_ChartA(d.date); })
      .attr("cy", (d) => { return yScale_ChartA(d.valence); })
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("fill", "white");
  
  const y_Area = d3.scaleLinear().domain([0,150]).range([(l_height - margin.top * 2), 0]);
  svg_ChartA.append("g").attr("class","yAxis_LineArea").attr("transform", "translate(" + l_width + ", 0)").call(d3.axisRight(y_Area));
  d3.select(".yAxis_LineArea").style("visibility", "hidden");

  /* Plot the area chart */
  var area = d3.area()
    .x(function(d) { return xScale_ChartA(d.date); })
    .y0(l_height - margin.top * 2)
    .y1(function(d) { return y_Area(d.count ); });

  svg_ChartA.append("path")
    .datum(areaChartObject[dataSetName])
    .attr("class", "area")
    .attr('fill', 'rgba(70, 130, 180)')
    .attr("opacity", 0.5)
    .attr("d", area);

  svg_ChartA.call( d3.brushX()                 
    .extent( [ [0,0], [l_width, l_height-20] ] ) 
    .on("start brush", brushChanged) 
  );

}

function brushChanged(event){
  extent = event.selection;
  var startDate;
  var endDate;
  for(var i=0; i<lineChartDateArray.length; i++){
    if(xScale_ChartA(lineChartDateArray[i])>=extent[0]){
      startDate = lineChartDateArray[i]
      break;
    }
  }
  for(var i=lineChartDateArray.length-1; i>=0; i--){
    if(xScale_ChartA(lineChartDateArray[i])<=extent[1]){
      endDate = lineChartDateArray[i]
      break;
    }
  
  }
  // console.log([startDate, endDate]);
  drawStreamGraph(true,[startDate, endDate]);
}

function circle_packing(date, valence, data_packing){

  /** 
     * Plot of the packing circles 
     * 
     */

  var dataset = {className: "root", children :[]};

  const circle_packing_data = data_packing.circle_packing_data;

  for(let d = 0; d < circle_packing_data.length; d++){
    let obj = circle_packing_data[d];
    if(obj.arousal > 0.5){
      obj.valence = parseFloat(obj.valence).toFixed(2);
      obj.dominance = parseFloat(obj.dominance).toFixed(2);
      obj.arousal = parseFloat(obj.arousal).toFixed(2);
      obj["emotion"] = keys[d];
      obj["value"] = parseFloat(data_packing[keys[d]]/data_packing.total_sum_emotions).toFixed(2);
      dataset.children.push(obj);
    }
  }

  divTip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("border", "1px solid white")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("opacity", 0);

  var r = 80;
  const pack = d3.pack().size([r, r]);
  
  container = svg.append("svg:svg")
      .attr("width", r)
      .attr("height", r)
      .attr("x", x(date) - 40)
      .attr("y", y(valence) - 40)
      .on("mouseleave", function(d,i) {
          d3.select(".container_svg").remove();
      })
      .attr("class", "container_svg");
    
  const nodes = d3.hierarchy(dataset)
      .sum(function(d) { return d.value; });
  
  var node = container.selectAll("g.node")
      .data(pack(nodes))
      .enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
  });
    
  node.append("svg:circle")
      .attr("r", function (d) {
      return d.r;
  })
  .style("fill", function (d) {
      return d.children ? 'white' : color(d.data.emotion);
  })
  .on("mouseover", function(d,i) {
    if(!i.children){
      divTip.style("opacity", .9);
      divTip.html(i.data.emotion + "<br><b>Valence: </b>" + i.data.valence + "<br><b>Arousal: </b>" + i.data.arousal 
      + "<br><b>Dominance: </b>" + i.data.dominance + "<br><b>Strength: </b>" + i.data.value)
      .style("left", (d.pageX) + "px").style("top", (d.pageY) + "px");
              
    }
  })
  .on("mouseleave", function(d,i) {
    divTip.style("opacity", 0);
  })
  .style("fill-opacity", function (d) {
      return d.children ? 0.4 : 1;
  })
  .style("stroke", "black")
  .style("stroke-width", 1.5)

  node.append("svg:rect")
      .attr("width", function (d) {
        return d.r * 2;
    })
    .attr("height", 2)
    .style("fill", "white")
    .attr("transform", function (d) {
      return "translate(" + -d.r + "," + 0 + ")";
    })
    .style("fill-opacity", function (d) {
      return d.children ? 0 : 1;
  })
}

function wordChart_AreaGraph(myWords){

    var cwidth = 240, cheight = 240;

    d3.select(".tooltip_area").append("svg")
            .attr("id", "area_wc_svg")
            .attr("width", 240)
            .attr("height", 240);

    /* Pie chart word cloud*/
    d3.layout.cloud()
        .size([cwidth, cheight])
        .words(myWords)
        .rotate(function() {
          return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .fontSize(function(d) {
          return d.freq;
        })
        .on("end", drawAreaWordCloud)
        .start();

    function drawAreaWordCloud(words) {
        d3.select("#area_wc_svg")
        .attr("width", cwidth)
        .attr("height", cheight)
        .append("g")
        .attr("transform", "translate(" + ~~(cwidth / 2) + "," + ~~(cheight / 2) + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .attr("class", "area_word_chart_text")
        .style("font-size", function(d) {
          return d.freq + "px";
        })
        .style("-webkit-touch-callout", "none")
        .style("-webkit-user-select", "none")
        .style("-khtml-user-select", "none")
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .style("user-select", "none")
        .style("cursor", "default")
        .style("font-family", "Impact")
        .style("fill", "black")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) {
          return d.word;
        });
    }
}


function aggregatedPieChart(){
    d3.select("#pie_svg").selectAll("*").remove();
    d3.select("#pie_word_cloud").selectAll("*").remove();
    const pie_width = 600, pie_height = 500, pie_margin = 30;
    const radius = Math.min(pie_width, pie_height) / 2 - pie_margin

    var data = {}
    for (const [key, value] of pieChartData[user]) {
      data[key] = value.size;
    }

    var wordChartData = [];
    const max = Math.max(...pieChartData[user].get("trust").values());
    for (const [key, value] of pieChartData[user].get("trust")) {
      if(max >= 60){
        wordChartData.push({text: key, size: value * (max / 60)});
      }else{
        wordChartData.push({text: key, size: value * (60 / max)});
      }
    }


    var pie_divTip = d3.select("body").append("div")
            .attr("class", "pie_tooltip")
            .style("border", "1px solid white")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("opacity", 0);

    // set the color scale
    var pie_arc = d3.arc().innerRadius(0).outerRadius(radius - 10)

    var pie_svg = d3.select("#pie_svg")
      .attr("width", pie_width)
      .attr("height", pie_height)
      .append("g")
      .attr('class', 'donut-container')
      .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");

    var pie = d3.pie().value(function(d) {return d[1]; });
    var data_ready = pie(Object.entries(data))

    /* Build the pie chart */
    pie_svg.selectAll('arc')
      .data(data_ready)
      .enter().append('path')
      .attr('class','arc')
      .attr('d', pie_arc)
      .on("mouseover", function(d,i) {

          pie_divTip.style("opacity", .9);
          pie_divTip.html(i.data[0]).style("left", (d.pageX) + "px").style("top", (d.pageY) + "px");
          
          /* Update wordchart on hover of the pie chart */
          wordChartData = [];
          d3.selectAll(".pie_word_chart_text").remove();
          Math.max(...pieChartData[user].get(i.data[0]).values());
          for (const [key, value] of pieChartData[user].get(i.data[0])) {
            if(max >= 40){
              wordChartData.push({text: key, size: value * (max / 60)}); // Size on a scale of 40
            }else{
              wordChartData.push({text: key, size: value * (60 / max)}); // Size on a scale of 40
            }
          }
          pieChartWordChart(pie_width, pie_height, wordChartData);
      })
      .on("mouseleave", function(d,i) {
          pie_divTip.style("opacity", 0);
      })
      .attr('fill', function(d){
          return color(d.data[0]);
      })
      .attr("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)

      pieChartWordChart(pie_width, pie_height, wordChartData);
}


function pieChartWordChart(pie_width, pie_height, wordChartData){
  /* Pie chart word cloud*/
    d3.layout.cloud()
        .size([pie_width, pie_height])
        .words(wordChartData)
        .rotate(function() {
          return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .fontSize(function(d) {
          return d.size;
        })
        .on("end", drawWordCloud)
        .start();

    function drawWordCloud(words) {
        d3.select("#pie_word_cloud")
        .attr("width", pie_width)
        .attr("height", pie_height)
        .append("g")
        .attr("transform", "translate(" + ~~(pie_width / 2) + "," + ~~(pie_height / 2) + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .attr("class", "pie_word_chart_text")
        .style("font-size", function(d) {
          return d.size + "px";
        })
        .style("-webkit-touch-callout", "none")
        .style("-webkit-user-select", "none")
        .style("-khtml-user-select", "none")
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .style("user-select", "none")
        .style("cursor", "default")
        .style("font-family", "Impact")
        .style("fill", "black")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) {
          return d.text;
        });
    }
}