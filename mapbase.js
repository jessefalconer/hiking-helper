
  let elSvc;
  let map;
  let polyline = new Array();
  let chart;
  let markers = new Array();
  let path = new Array();
  let lineardistance = new Array();
  let absolutedistance = new Array();
  let down = new Array();
  let up = new Array();
  let elevator;
  let poly;
  let units = "metric";
  let generated = true;

  google.load('visualization', '1', {packages: ['corechart']});


function initMap (location) {

  $('input:checkbox').change(
    function(){
      if ($(this).is(':checked')) {
        units = "imperial";
          if (generated == false) {
            toImperial();
          }
      } else {
        units = "metric";
          if (generated == false) {
            toMetric();
          }
      }
    });

  let currentLocation = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);

  elevator = new google.maps.ElevationService();

  let mapOptions = {
    center: currentLocation,
    zoom: 9,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggableCursor:'crosshair'
  }

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {
    plotPoints(event.latLng);
  });

  google.maps.event.addListener(map, 'mousemove', function (event) {
    displayCoordinates(event.latLng);
  });

    //

    //Rubberband polyline feature, not ready
    // google.maps.event.addListener(map, 'mousemove', function (event) {
    //                 rubberPoly(event.latLng);
    // });
    // poly = new google.maps.Polyline({
    //           strokeColor: '#FF0000',
    //           strokeOpacity: 1.0,
    //           strokeWeight: 3,
    //           map: map
    // });


  chart = new google.visualization.ColumnChart(document.getElementById('elevation-chart'));

  elSvc = new google.maps.ElevationService();
  let input = document.getElementById('pac-input');
  let searchBox = new google.maps.places.SearchBox(input);

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    let places = searchBox.getPlaces();
    let bounds = new google.maps.LatLngBounds();

    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      let icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
          } else {
              bounds.extend(place.geometry.location);
            }
        });

      map.fitBounds(bounds);
      $("#pac-input").val('');
  });

  center_map(map);

  google.setOnLoadCallback(drawChart);

  let data = google.visualization.arrayToDataTable([
    ['Task', 'Hours per Day'],
    ['1', 11],
    ['2', 2],
    ['3', 2],
    ['4', 3],
    ['5', 7],
    ['6', 20],
    ['7', 17],
    ['8', 11],
    ['9', 2],
    ['10', 9]
  ]);

  let chart1 = new google.visualization.ColumnChart(document.getElementById('elevation-chart'));

  let options1 = {
    backgroundColor: "#475965",
    colors: ['#a0b1bc', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],
    vAxis: {
    textStyle:{color:'#FFF'}},
    width: 1316,
    height: 152,
    legend: 'none',
    bar: {groupWidth: '100%'},
    hAxis: { textPosition: 'none' },
    animation:{
      'duration': 5000,
      'easing': 'out',
    },
    vAxis: {minValue:0, maxValue:50}
  };

  setInterval(change, 3000);

  function drawChart() {
        chart.draw(data, options1);
  }

  let ch=0;
    function change(){
      if (ch == 0) {
        data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Day'],
          ['1', 9],
          ['2', 20],
          ['3', 15],
          ['4', 20],
          ['5', 17],
          ['6', 10],
          ['7', 2],
          ['8', 14],
          ['9', 24],
          ['10', 40]
        ]);
        ch=1;
      } else if (ch == 1) {
          data = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['1', 10],
            ['2', 2],
            ['3', 12],
            ['4', 24],
            ['5', 41],
            ['6', 6],
            ['7', 40],
            ['8', 20],
            ['9', 2],
            ['10', 17]
          ]);
          ch=0;
      }
      chart1.draw(data, options1);
  }
}

function center_map(map) {
  let center = map.getCenter();
  document.getElementById("map-canvas").style.width = '100%';
  google.maps.event.trigger(map, 'resize');
  map.setCenter(center);
}

function reset() {
  generated = true;
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null)
  }
  for (let i = 0; i < polyline.length; i++) {
    polyline[i].setMap(null)
  }
  absolutedistance = new Array();
  markers = new Array();
  path = new Array();
  polyline = new Array ();
  lineardistance = new Array ();
  down = new Array();
  up = new Array();
  $('.results').html("&nbsp;");
  $('#difficulty').html('&nbsp;');
  $('#vector').html('&nbsp;');
    // map.getCenter(initMap);
}

//Rubberband Polyline function, not ready
  // function rubberPoly(pnt) {
  //
  //   if (path.length >= 1){
  //   newpoly = [pnt, path[path.length - 1]]
  //   poly.setPath(newpoly);
  //   }
  //
  // }

function toImperial() {
  $('#elevation-gain').html("&nbsp;");
  $('#elevation-loss').html("&nbsp;");
  $('#distance').html("&nbsp;");
  $('#map-distance').html("&nbsp;");
  $('#starting-elevation').html("&nbsp;");
  $('#finishing-elevation').html("&nbsp;");
  $('#elevation-gain').html((totalup*3.28084).toFixed(0) + 'ft');
  $('#elevation-loss').html((totaldown * -3.28084).toFixed(0) + 'ft');
  $('#distance').html( (totalabsolutedistance/1000*0.62137121212121).toFixed(2) + 'mi');
  $('#map-distance').html( (totaldistance/1000*0.62137121212121).toFixed(2) + 'mi');
  $('#starting-elevation').html((startingelevation*3.28084).toFixed(2) + 'ft');
  $('#finishing-elevation').html((finishingelevation*3.28084).toFixed(2) + 'ft');
}

function toMetric() {
  $('#elevation-gain').html("&nbsp;");
  $('#elevation-loss').html("&nbsp;");
  $('#distance').html("&nbsp;");
  $('#map-distance').html("&nbsp;");
  $('#starting-elevation').html("&nbsp;");
  $('#finishing-elevation').html("&nbsp;");
  $('#elevation-gain').html((totalup).toFixed(0) + 'm');
  $('#elevation-loss').html((totaldown * -1).toFixed(0) + 'm');
  $('#distance').html( (totalabsolutedistance/1000).toFixed(2) + 'km');
  $('#map-distance').html( (totaldistance/1000).toFixed(2) + 'km');
  $('#starting-elevation').html(startingelevation.toFixed(2) + 'm');
  $('#finishing-elevation').html(finishingelevation.toFixed(2) + 'm');
}

function displayCoordinates(point) {

  let coordsLabel = document.getElementById("tdCursor");
  let lat = point.lat();
  lat = lat.toFixed(6);
  let lng = point.lng();
  lng = lng.toFixed(6);
  $('#instant-long').html(lng);
  $('#instant-lat').html(lat);
  let locations = [];
  let location = new google.maps.LatLng(lat, lng);
  locations.push(location);
  let positionRequest = { 'locations': locations }

  elevator.getElevationForLocations(positionRequest, function (results, status) {
    if (status == google.maps.ElevationStatus.OK) {
      if (path.length >= 1) {
        let last_element = path[path.length - 1]
        let vector = google.maps.geometry.spherical.computeDistanceBetween(last_element, point);
        let segmentheading = this.google.maps.geometry.spherical.computeHeading(last_element, point);
        let heading1;
        let heading2;

        switch(true) {
          case ( segmentheading >= -180 && segmentheading < -135 ):
            segmentheading = (segmentheading + 180).toFixed(2);
            heading1="W";
            heading2="S";
            break;
          case ( segmentheading >= -135 && segmentheading < -90 ):
            segmentheading = ((-1 * segmentheading) - 90).toFixed(2);
            heading1="S";
            heading2="W";
            break;
          case ( segmentheading >= -90 && segmentheading < -45 ):
            segmentheading = (segmentheading + 90).toFixed(2);
            heading1="N";
            heading2="W";
            break;
          case ( segmentheading >= -45 && segmentheading < 0 ):
            segmentheading = (-1 * segmentheading).toFixed(2);
            heading1="W";
            heading2="N";
            break;
          case ( segmentheading >= 0 && segmentheading < 45 ):
            segmentheading = (segmentheading).toFixed(2);
            heading1="E";
            heading2="N";
            break;
          case ( segmentheading >= 45 && segmentheading < 90 ):
            segmentheading = (90 - segmentheading).toFixed(2);
            heading1="N";
            heading2="E";
            break;
          case ( segmentheading >= 90 && segmentheading < 135 ):
            segmentheading = (segmentheading - 90).toFixed(2);
            heading1="S";
            heading2="E";
            break;
          case ( segmentheading >= 135 && segmentheading < 180 ):
            segmentheading = (180 - segmentheading).toFixed(2);
            heading1="E";
            heading2="S";
            break;
          default:
            segmentheading = "Error";
        }

        if (units == "metric") {
          $('#instant-elev').html(results[0].elevation.toFixed(2) + 'm ');
            if (vector > 10000) {
              $('#vector').html((vector/1000).toFixed(2) + 'km ');
            } else {
              $('#vector').html(vector.toFixed(2) + 'm ');
            }
        } else {
          $('#instant-elev').html((results[0].elevation*3.28084).toFixed(2) + 'ft ');
            $('#vector').html((vector*0.000621371).toFixed(2) + 'mi ');
        }

      $('#heading-degrees').html(segmentheading);
      $('#heading1').html(heading1);
      $('#heading2').html(heading2);

      } else {

        if (units == "metric") {
          $('#instant-elev').html(results[0].elevation.toFixed(2) + 'm ');
        } else {
          $('#instant-elev').html((results[0].elevation*3.28084).toFixed(2) + 'ft ')
        }
      }
    }
  });
}

function plotPoints(theLatLng) {
  generated = false;
  if (path.length >= 1) {
    let last_element = path[path.length - 1]
    let vector = google.maps.geometry.spherical.computeDistanceBetween(last_element, theLatLng);
    let segmentheading = this.google.maps.geometry.spherical.computeHeading(last_element, theLatLng);

    lineardistance.push(vector);
  }
  path.push(theLatLng);

  if (path.length == 1) {
    markers.push(new google.maps.Marker({
      position: theLatLng,
      map: map
    }));
  }

  let pathOptions = {
    path: path,
    strokeColor: '#0000CC',
    opacity: 0.4,
    map: map
  }

  polyline.push(new google.maps.Polyline(pathOptions));
}

function plottingComplete() {
  if (path.length < 2) {
    alert("Draw a path first!");
  } else if (generated == true) {
    alert("No new paths added!");
  } else {
    generated = true;
    $('#difficulty').html('&nbsp;');
    $('.results').html("&nbsp;");
    let last_marker = path[path.length - 1]
    markers.push(new google.maps.Marker({
      position: last_marker,
      map: map
    }));

    window.totalMarkers = markers.length

    window.samples = $('#user-form > input[name="samples"]').val();
    if (units == "imperial") {
      window.weight = ($('#user-form > input[name="weight"]').val())/2.20462;
      window.pweight = ($('#user-form > input[name="pack-weight"]').val())/2.20462;
    } else {
      window.weight = $('#user-form > input[name="weight"]').val();
      window.pweight = $('#user-form > input[name="pack-weight"]').val();
    }
    window.totaldistance = lineardistance.reduce(function(a, b) { return a + b; }, 0);
    let pathOptions = {
      path: path,
      strokeColor: '#0000CC',
      opacity: 0.4,
      map: map
    }

    polyline.push(new google.maps.Polyline(pathOptions));

    let pathRequest = {
      'path': path,
      'samples': parseInt(samples)
    }

    elSvc.getElevationAlongPath(pathRequest, plotElevation);
  }
}

function plotElevation(results, status) {
  let energy = 0;
  let adjacent = (totaldistance/(samples - 1));
  let totalweight = (pweight + weight);
    if (status == google.maps.ElevationStatus.OK) {
      elevations = results;
      let data = new google.visualization.DataTable();
      data.addColumn('string', 'Sample');
      data.addColumn('number', 'Elevation');

        for (let i = 0; i < results.length; i++) {
          data.addRow(['', elevations[i].elevation]);
        }

        for (let i = 0; i < elevations.length - 1; i++) {
          absolutedistance.push(((adjacent**2)+((elevations[i+1].elevation - elevations[i].elevation)**2))**0.5);
          if (elevations[i+1].elevation - elevations[i].elevation >= 0) {
            up.push(elevations[i+1].elevation - elevations[i].elevation);
          } else {
            down.push(elevations[i+1].elevation - elevations[i].elevation);
          }
        }

      window.startingelevation = elevations[0].elevation;
      window.finishingelevation = elevations[samples - 1].elevation;
      window.totalabsolutedistance = absolutedistance.reduce(function(a, b) { return a + b; }, 0);
      let pace = (totalabsolutedistance / 2000).toFixed(1);
      window.totalup = up.reduce(function(a, b) { return a + b; }, 0);
      window.totaldown = down.reduce(function(a, b) { return a + b; }, 0);
      let averagegrade = ((finishingelevation - startingelevation)/totaldistance)*100;

    if (units == "imperial"){
      $('#elevation-gain').append((totalup*3.28084).toFixed(0) + 'ft');
      $('#elevation-loss').append((totaldown * -3.28084).toFixed(0) + 'ft');
      $('#distance').append( (totalabsolutedistance/1000*0.62137121212121).toFixed(2) + 'mi');
      $('#map-distance').append( (totaldistance/1000*0.62137121212121).toFixed(2) + 'mi');
      $('#starting-elevation').append((startingelevation*3.28084).toFixed(2) + 'ft');
      $('#finishing-elevation').append((finishingelevation*3.28084).toFixed(2) + 'ft');
    } else {
      $('#elevation-gain').append((totalup).toFixed(0) + 'm');
      $('#elevation-loss').append((totaldown * -1).toFixed(0) + 'm');
      $('#distance').append( (totalabsolutedistance/1000).toFixed(2) + 'km');
      $('#map-distance').append( (totaldistance/1000).toFixed(2) + 'km');
      $('#starting-elevation').append(startingelevation.toFixed(2) + 'm');
      $('#finishing-elevation').append(finishingelevation.toFixed(2) + 'm');
    }
    $('#completion-time').append('~' + pace + 'hrs');
    $('#average-grade').append(averagegrade.toFixed(2) + '%');

    let chartOptions =  {
      animation: {
        startup: true
      },
      backgroundColor: "#475965",
      colors: ['#a0b1bc', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],
      width: 1375,
      height: 152,
      legend: 'none',
      vAxis: {
        textStyle:{color: ['#FFF']}
      },
    }

    chart.draw(data, chartOptions);
    let difficulty;

    switch(true) {
      case ( totalup >= 15000 ):
        difficulty = "Extreme Terrain";
        break;
      case ( totalup >= 5000 && pace > 15 ):
        difficulty = "Extreme Endurance";
        break;
      case ( totalup >= 3000 && pace > 8 ):
        difficulty = "Difficult Hike";
        break;
      case ( totalup >= 2000 && pace > 6):
        difficulty = "Moderate Hike";
        break;
      case ( totalup > 300 && pace > 1.5):
        difficulty = "Moderate Hike";
        break;
      case ( totalup >= 150 && pace > 1 ):
        difficulty = "Easy Hike";
        break;
      case ( totalup < 150 && pace > 0.6 ):
        difficulty = "Quick Hike";
        break;
      default:
        difficulty = "Short Walk";
    }

    energy = (totalweight * -9.81 * totaldown * 0.8 * 0.000239006) + (totalweight * 9.81 * totalup * 0.000239006 * 1.1) + (45 * (totalabsolutedistance/1000)) + (weight * pace);

    let efficiency;
      if (averagegrade >= 0) {
        efficiency = (totalup * 100 / (totalup + (-1 * totaldown)))
      } else {
        efficiency = (totaldown * -100 / (totalup + (-1 * totaldown)))
      }

    $('#path-efficiency').append(efficiency.toFixed(2) + '%')
    $('#calories').append(energy.toFixed(0));
    $('#difficulty').append(difficulty);
  }

}

$(document).ready(function (){
  navigator.geolocation.getCurrentPosition(initMap);
  document.getElementById("samples").defaultValue = "300";
});

$(document).ready(function(){

  let submitIcon = $('.searchbox-icon');
  let inputBox = $('.searchbox-input');
  let searchBox = $('.searchbox');
  let isOpen = false;
  submitIcon.click(function(){
    if (isOpen == false) {
      searchBox.addClass('searchbox-open');
      inputBox.focus();
      isOpen = true;
    } else {
      searchBox.removeClass('searchbox-open');
      inputBox.focusout();
      isOpen = false;
    }
  });
  submitIcon.mouseup(function(){
    return false;
  });
  searchBox.mouseup(function(){
    return false;
  });

  $(document).mouseup(function(){
    if (isOpen == true) {
      $('.searchbox-icon').css('display','block');
      submitIcon.click();
    }
  });
});

function buttonUp(){
  let inputVal = $('.searchbox-input').val();
    inputVal = $.trim(inputVal).length;
      if (inputVal !== 0){
        $('.searchbox-icon').css('display','none');
      } else {
        $('.searchbox-input').val('');
        $('.searchbox-icon').css('display','block');
      }
}
