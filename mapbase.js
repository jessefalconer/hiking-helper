  let elSvc;
  let map;
  let polyline = new Array();
  let chart;
  let markers = new Array();
  let path = new Array();
  let distance = new Array();
  let down = new Array();
  let up = new Array();

  //Load columnchart API

  google.load('visualization', '1', {packages: ['columnchart']});

  function initMap (location) {

      let currentLocation = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);

      let mapOptions = {
        center: currentLocation,
        zoom: 9,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

      //create a new chart in the elevation-chart DIV
      chart = new google.visualization.ColumnChart(document.getElementById('elevation-chart'));

      //create an ElevationService
      elSvc = new google.maps.ElevationService();

      google.maps.event.addListener(map, 'click', function(event) {
        plotPoints(event.latLng);
      });

      // google.maps.event.addListener(map, 'rightclick', function(event) {
      //   plottingComplete(event.latLng);
      // });

  }

  function reset() {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null)
    }
    for (let i = 0; i < polyline.length; i++) {
      polyline[i].setMap(null)
    }
    markers = new Array();
    path = new Array();
    polyline = new Array ();
    distance = new Array ();
    $('#data').html('');
    // $('#elevation-chart').html('');
    map.getCenter(initMap);
  }

  function plotPoints(theLatLng) {
    if (path.length >= 1) {
    let last_element = path[path.length -1]
    let segmentdistance = google.maps.geometry.spherical.computeDistanceBetween(last_element, theLatLng);
    distance.push(segmentdistance);
    $('#data').append('<li>' + (segmentdistance/1000).toFixed(2) + '</li>');
    }
    path.push(theLatLng);
    markers.push(new google.maps.Marker({
      position: theLatLng,
      map: map
    }));

    let pathOptions = {
      path: path,
      strokeColor: '#0000CC',
      opacity: 0.4,
      map: map
    }
    polyline.push(new google.maps.Polyline(pathOptions));
  }

  function plottingComplete() {
    window.weight = $('#user-form > input[name="weight"]').val();
    window.pweight = $('#user-form > input[name="pack-weight"]').val();
    if (path.length >= 1) {
    window.totaldistance = distance.reduce(function(a, b) { return a + b; }, 0);
    $('#data').append('<li>' + 'Total Distance: ' + (totaldistance/1000).toFixed(2) + '</li>');
    }
    let pathOptions = {
      path: path,
      strokeColor: '#0000CC',
      opacity: 0.4,
      map: map
    }

    polyline.push(new google.maps.Polyline(pathOptions));

    let pathRequest = {
      'path': path,
      'samples': 256
    }

    elSvc.getElevationAlongPath(pathRequest, plotElevation);
  }

  function plotElevation(results, status) {
    let totalweight = (pweight + weight);
    if (distance.length < 1) {
      alert("Draw a path first!");
    } else {
      if (status == google.maps.ElevationStatus.OK) {
        elevations = results
        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation');
        for (let i = 0; i < results.length; i++) {
          data.addRow(['', elevations[i].elevation])
        }
        for (let i = 0; i < elevations.length - 1; i++) {
          if (elevations[i+1].elevation - elevations[i].elevation >= 0) {
            up.push(elevations[i+1].elevation - elevations[i].elevation);
          } else {
            down.push(elevations[i+1].elevation - elevations[i].elevation);
          }
        }
      let totalup = up.reduce(function(a, b) { return a + b; }, 0);
      let totaldown = down.reduce(function(a, b) { return a + b; }, 0);
      $('#data').append('<li>' + totalup.toFixed(2) + '</li>');
      $('#data').append('<li>' + totaldown.toFixed(2) + '</li>');
      // document.getElementById('elevation-chart').style.display='block';
      chart.draw(data, {
        width: 640,
        height: 200,
        legend: 'none',
        titleY: 'Elevation (m)'
      });
      $('#elevation-chart').append(chart)
      let energy = (totalweight * -9.81 * totaldown * 0.9 * 0.000239006) + (totalweight * 9.81 * totalup * 0.000239006) + (30 * (totaldistance/1000));
      $('#data').append('<li>' + energy.toFixed(2) + ' calories' + '</li>');
    }
  }
  }

  $(document).ready(function (){
    navigator.geolocation.getCurrentPosition(initMap);
  });
