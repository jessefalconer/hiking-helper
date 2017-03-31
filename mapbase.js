  let elSvc;
  let map;
  let polyline = new Array();
  let chart;
  let markers = new Array();
  let path = new Array();

  //Load columnchart API

  google.load('visualization', '1', {packages: ['columnchart']});

  function initMap (location) {

      const CURRENT_LOCATION = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);

      let mapOptions = {
        center: CURRENT_LOCATION,
        zoom: 9,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

      //create a new chart in the elevation_chart DIV
      chart = new google.visualization.ColumnChart(document.getElementById('elevation_chart'));

      //create an ElevationService
      elSvc = new google.maps.ElevationService();

      google.maps.event.addListener(map, 'click', function(event) {
        plotPoints(event.latLng);
      });

      google.maps.event.addListener(map, 'rightclick', function(event) {
        plottingComplete(event.latLng);
      });

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
    initMap(map.getCenter());
  }

  function plotPoints(theLatLng) {
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

  function plottingComplete(theLatLng) {
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

    let pathRequest = {
      'path': path,
      'samples': 256
    }

    elSvc.getElevationAlongPath(pathRequest, plotElevation);
  }

  function plotElevation(results, status) {
    if (status == google.maps.ElevationStatus.OK) {
      elevations = results
      let data = new google.visualization.DataTable();
      data.addColumn('string', 'Sample');
      data.addColumn('number', 'Elevation');
      for (let i = 0; i < results.length; i++) {
        data.addRow(['', elevations[i].elevation])
      }

      document.getElementById('elevation_chart').style.display='block';
      chart.draw(data, {
        width: 640,
        height: 200,
        legend: 'none',
        titleY: 'Elevation (m)'
      });
    }
  }

  $(document).ready(function (){
    navigator.geolocation.getCurrentPosition(initMap);
  });
