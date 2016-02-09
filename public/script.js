var map;
var geocoder;
var socket = io();

var markers = [];

function deleteAllMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function SettingsControl(settingsDiv, map) {
  var control = this;

  //set properties upon construction
  control.center = {
    lat: 0,
    lng: 0
  }
  settingsDiv.style.clear = "both";

  //set CSS for setCenter control border
  var setCenterUI = document.createElement('div');
  setCenterUI.id = 'setCenterUI';
  setCenterUI.title = 'click to set the center of the map';
  settingsDiv.appendChild(setCenterUI);

  //set CSS for setCenter interion
  var setCenterText = document.createElement('div');
  setCenterText.id = 'setCenterText';
  setCenterText.innerHTML = 'Set Center';
  setCenterUI.appendChild(setCenterText);

  //set CSS for setTracker control border
  var setTrackerUI = document.createElement('div');
  setTrackerUI.id = 'setTrackerUI';
  setTrackerUI.title = 'click to set what is tracked';
  settingsDiv.appendChild(setTrackerUI);

  //set CSS for setTracker interior
  var setTrackerText = document.createElement('div');
  setTrackerText.id = 'setTrackerText';
  setTrackerText.innerHTML = 'Set Tracker';
  setTrackerUI.appendChild(setTrackerText);

  setCenterUI.addEventListener('click', function() {
    console.log('setting center');
    tmpCenter = prompt('enter a center location');
    console.log(tmpCenter);
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      address: tmpCenter
    }, function(results, status) {

      var loc = {
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      }

      map.setCenter(loc);
      map.setZoom(5);
    })
  });

  setTrackerUI.addEventListener('click', function() {
    console.log('setting tracker');
    tmpTracker = prompt('enter a term you want to track');
    socket.emit('switchtracker', tmpTracker);
    console.log(tmpTracker);
    deleteAllMarkers();
  });

}

SettingsControl.prototype.center = null;

function initMap() {
  // initialize what we need so far
  geocoder = new google.maps.Geocoder();
  var worldCenter = {lat: 0, lng: 0};
  map = new google.maps.Map(document.getElementById('map'), {
    center: worldCenter,
    zoom: 3
  });

  var settingsDiv = document.createElement('div');
  var settingsControl = new SettingsControl(settingsDiv, map);

  settingsDiv.index = 1;
  settingsDiv.style['padding-top'] = '10px';

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(settingsDiv);


  socket.on('tweet', function(tweet){

    console.log(tweet.text);

    geocoder.geocode( { 'address': tweet.user.location}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        contentString = tweet.text;

        var loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        }

        bounds = map.getBounds();

        latlng = new google.maps.LatLng(loc);

        if (bounds.contains(latlng)) {
          var marker = new google.maps.Marker({
            position: loc,
            map: map,
            title: tweet.text
          });

          markers.push(marker);

          var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 500
          });

          setTimeout(function() {
            infowindow.open(map, marker);
          }, 100);
        }

      } else {
        console.log('it did not work');
      }
    });
  });
}
