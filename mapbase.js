
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

  google.load('visualization', '1', {packages: ['columnchart']});


  function initMap (location) {
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
  }

  function center_map(map) {
    let center = map.getCenter();
    document.getElementById("map-canvas").style.width = '100%';
    google.maps.event.trigger(map, 'resize');
    map.setCenter(center);
  }

  function reset() {
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
    let totalup = 0;
    let totaldown = 0;
    let totaldistance = 0;
    let totalweight = 0;
    let pweight = 0;
    let weight = 0;
    $('.results').html("&nbsp;");
    $('#difficulty').html('&nbsp;');
    // $('#elevation-chart').html('');
    // map.getCenter(initMap);
  }

//Rubberband Polyline function, not ready
  function rubberPoly(pnt) {

    if (path.length >= 1){
    newpoly = [pnt, path[path.length - 1]]
    poly.setPath(newpoly);
    }

  }

  function displayCoordinates(point) {

    let coordsLabel = document.getElementById("tdCursor");
    let lat = point.lat();
    lat = lat.toFixed(4);
    let lng = point.lng();
    lng = lng.toFixed(4);

    let locations = [];
    let location = new google.maps.LatLng(lat, lng);
    locations.push(location);
    let positionRequest = { 'locations': locations }

    elevator.getElevationForLocations(positionRequest, function (results, status) {
      if (status == google.maps.ElevationStatus.OK) {
        if (path.length >= 1) {
          let last_element = path[path.length - 1]
          let segmentdistance = google.maps.geometry.spherical.computeDistanceBetween(last_element, point);
          let segmentheading = this.google.maps.geometry.spherical.computeHeading(last_element, point);

          switch(true) {
            case ( segmentheading >= -180 && segmentheading < -135 ):
              segmentheading = (segmentheading + 180).toFixed(2).toString() + "° W of S ";
              break;
            case ( segmentheading >= -135 && segmentheading < -90 ):
              segmentheading = ((-1 * segmentheading) - 90).toFixed(2).toString() + "° S of W ";
              break;
            case ( segmentheading >= -90 && segmentheading < -45 ):
              segmentheading = (segmentheading + 90).toFixed(2).toString() + "° N of W ";
              break;
            case ( segmentheading >= -45 && segmentheading < 0 ):
              segmentheading = (-1 * segmentheading).toFixed(2).toString() + "° W of N ";
              break;
            case ( segmentheading >= 0 && segmentheading < 45 ):
              segmentheading = (segmentheading).toFixed(2).toString() + "° E of N ";
              break;
            case ( segmentheading >= 45 && segmentheading < 90 ):
              segmentheading = (90 - segmentheading).toFixed(2).toString() + "° N of E ";
              break;
            case ( segmentheading >= 90 && segmentheading < 135 ):
              segmentheading = (segmentheading - 90).toFixed(2).toString() + "° S of E ";
              break;
            case ( segmentheading >= 135 && segmentheading < 180 ):
              segmentheading = (180 - segmentheading).toFixed(2).toString() + "° E of S ";
              break;
            default:
              segmentheading;
        }

      $('#instant-long').html(lng);
      $('#instant-lat').html(lat);
      $('#instant-elev').html(results[0].elevation.toFixed(2) + 'm ');
      $('#vector').html(segmentdistance.toFixed(2) + 'm ');
      $('#heading').html(segmentheading + ' ');

      } else {
        $('#instant-long').html(lng);
        $('#instant-lat').html(lat);
        $('#instant-elev').html(results[0].elevation.toFixed(2) + 'm ');
      }
    }
  });

}

  function plotPoints(theLatLng) {
    if (path.length >= 1) {
      let last_element = path[path.length - 1]
      let segmentdistance = google.maps.geometry.spherical.computeDistanceBetween(last_element, theLatLng);
      let segmentheading = this.google.maps.geometry.spherical.computeHeading(last_element, theLatLng);

      lineardistance.push(segmentdistance);
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
    $('.results').html("&nbsp;");
    let last_marker = path[path.length - 1]
    markers.push(new google.maps.Marker({
      position: last_marker,
      map: map
    }));
    window.weight = $('#user-form > input[name="weight"]').val();
    window.pweight = $('#user-form > input[name="pack-weight"]').val();
    window.samples = $('#user-form > input[name="samples"]').val();
    if (path.length >= 1) {
      window.totaldistance = lineardistance.reduce(function(a, b) { return a + b; }, 0);
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
      'samples': parseInt(samples)
    }

    elSvc.getElevationAlongPath(pathRequest, plotElevation);
  }

  function plotElevation(results, status) {
    let adjacent = (totaldistance/(samples - 1))
    let totalweight = (pweight + weight);
    if (lineardistance.length < 1) {
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
          absolutedistance.push(((adjacent**2)+((elevations[i+1].elevation - elevations[i].elevation)**2))**0.5)
          if (elevations[i+1].elevation - elevations[i].elevation >= 0) {
            up.push(elevations[i+1].elevation - elevations[i].elevation);
          } else {
            down.push(elevations[i+1].elevation - elevations[i].elevation);
          }
        }
      let startingelevation = elevations[0].elevation
      let finishingelevation = elevations[samples - 1].elevation
      let totalabsolutedistance = absolutedistance.reduce(function(a, b) { return a + b; }, 0);
      let pace = (totalabsolutedistance / 2000).toFixed(1);
      let totalup = up.reduce(function(a, b) { return a + b; }, 0);
      let totaldown = down.reduce(function(a, b) { return a + b; }, 0);
      let averagegrade = ((finishingelevation - startingelevation)/totaldistance)*100

      $('#elevation-gain').append((totalup).toFixed(0) + 'm');
      $('#elevation-loss').append((totaldown * -1).toFixed(0) + 'm');
      $('#distance').append( (totalabsolutedistance/1000).toFixed(2) + 'km');
      $('#map-distance').append( (totaldistance/1000).toFixed(2) + 'km');
      $('#completion-time').append('~' + pace + 'hrs');
      $('#starting-elevation').append(startingelevation.toFixed(2) + 'm');
      $('#finishing-elevation').append(finishingelevation.toFixed(2) + 'm');
      $('#average-grade').append(averagegrade.toFixed(2) + '%');

      chart.draw(data, {
        backgroundColor: "#475965",
        colors: ['black', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],
        width: 1316,
        height: 152,
        legend: 'none'
      });

      let difficulty;

      switch(true) {
        case ( totalup >= 10000 || pace > 10 ):
          difficulty = "Extreme Terrain and Endurance";
          break;
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
        case ( totalup < 300 && pace > 0.75):
          difficulty = "Moderate Walk";
          break;
        case ( totalup >= 500 && pace > 2 ):
          difficulty = "Easy Hike";
          break;
        case ( totalup < 100 && pace < 0.6 ):
          difficulty = "Easy Walk";
          break;
        default:
          difficulty = "Short Walk";
      }

      $('#difficulty').append(difficulty);
      $('#chart').append(chart)
      let energy = (totalweight * -9.81 * totaldown * 0.8 * 0.000239006) + (totalweight * 9.81 * totalup * 0.000239006 * 1.1) + (45 * (totalabsolutedistance/1000)) + (weight * pace);
      $('#calories').append(energy.toFixed(0));

      let efficiency;
        if (averagegrade >= 0) {
          efficiency = (totalup * 100 / (totalup + (-1 * totaldown)))
        } else {
          efficiency = (totaldown * -100 / (totalup + (-1 * totaldown)))
        }
      $('#path-efficiency').append(efficiency.toFixed(2) + '%')
      }
    }
  }

  $(document).ready(function (){
    navigator.geolocation.getCurrentPosition(initMap);
    document.getElementById("samples").defaultValue = "300";
  });
  $(document).ready(function(){
             var submitIcon = $('.searchbox-icon');
             var inputBox = $('.searchbox-input');
             var searchBox = $('.searchbox');
             var isOpen = false;
             submitIcon.click(function(){
                 if(isOpen == false){
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
                     if(isOpen == true){
                         $('.searchbox-icon').css('display','block');
                         submitIcon.click();
                     }
                 });
         });
             function buttonUp(){
                 var inputVal = $('.searchbox-input').val();
                 inputVal = $.trim(inputVal).length;
                 if( inputVal !== 0){
                     $('.searchbox-icon').css('display','none');
                 } else {
                     $('.searchbox-input').val('');
                     $('.searchbox-icon').css('display','block');
                 }
             }
