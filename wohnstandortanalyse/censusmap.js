// Base map
var osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});

// Census map layer
var wmsLayer = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: 'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {'LAYERS': 'g03_2014:normalizedv'}
  }),
  opacity: 0.6
});

// Map object
olMap = new ol.Map({
  target: 'map',
  renderer: 'canvas',
  layers: [osmLayer, wmsLayer],
  view: new ol.View({
    center: ol.proj.transform([16.3, 48.2], 'EPSG:4326', 'EPSG:3857'),
    zoom: 11,
    maxZoom: 18
  })
});

// Load variables into dropdown
$.get("data/DataDict.txt", function(response) {
  // We start at line 3 - line 1 is column names, line 2 is not a variable
  $(response.split('\n').splice(2)).each(function(index, line) {
    $('#topics').append($('<option>')
      .val(line.substr(0, 36).trim())
      .html(line.substr(36, 105).trim()));
  });
});

// Add behaviour to dropdown
$('#topics').change(function() {
  wmsLayer.getSource().updateParams({
    'viewparams': 'column:' + $('#topics>option:selected').val()
  });
});

// Create an ol.Overlay with a popup anchored to the map
var popup = new ol.Overlay({
  element: $('#popup')
});
olMap.addOverlay(popup);

// Handle map clicks to send a GetFeatureInfo request and open the popup
olMap.on('singleclick', function(evt) {
  var view = olMap.getView();
  var url = wmsLayer.getSource().getGetFeatureInfoUrl(evt.coordinate,
      view.getResolution(), view.getProjection(), {'INFO_FORMAT': 'text/html'});
  popup.setPosition(evt.coordinate);
  $('#popup-content iframe').attr('src', url);
  $('#popup')
    .popover({content: function() { return $('#popup-content').html(); }})
    .popover('show');
  // Close popup when user clicks on the 'x'
  $('.popover-title').click(function() {
    $('#popup').popover('hide');
  });
  
  $('.popover form')[0].onsubmit = function(e) {
  var feature = new ol.Feature();
  feature.setGeometryName('geom');
  feature.setGeometry(new ol.geom.Point(evt.coordinate));
  feature.set('comment', this.comment.value);
  var xml = new ol.format.WFS().writeTransaction([feature], null, null, {
    featureType: 'comments', featureNS: 'http://geoweb/2014/g03',
    gmlOptions: {srsName: 'EPSG:3857'}
  });
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://student.ifip.tuwien.ac.at/geoserver/wfs', true);
  xhr.onload = function() {
    wmsLayer.getSource().updateParams({});
    alert('Thanks for your comment.');
  };
  xhr.send(new XMLSerializer().serializeToString(xml));
  e.preventDefault();
};
});

// Submit query to Nominatim and zoom map to the result's extent
var form = document.forms[0];
form.onsubmit = function(evt) {
  var url = 'http://nominatim.openstreetmap.org/search?format=json&q=';
  url += form.query.value;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function() {
    var result = JSON.parse(xhr.responseText);
    if (result.length > 0) {
      var bbox = result[0].boundingbox;
      olMap.getView().fitExtent(ol.proj.transform([parseFloat(bbox[2]),
          parseFloat(bbox[0]), parseFloat(bbox[3]), parseFloat(bbox[1])],
          'EPSG:4326', 'EPSG:3857'), olMap.getSize());
    }
  };
  xhr.send();
  evt.preventDefault();
};

    // Standorttest
    function newgeol() {
    var geolocation = new ol.Geolocation({
    projection: 'EPSG:3857'
    });
    geolocation.setTracking(true); // here the browser may ask for confirmation
    geolocation.on('change', function() {
    geolocation.setTracking(false);
    olMap.getView().fitGeometry(geolocation.getAccuracyGeometry(), olMap.getSize(), {maxZoom: 18});
    marker.setGeometry(new ol.geom.Point(olMap.getView().getCenter()));
    });
    }

var p_ubahn = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url:'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {VERSION: '1.1.1', LAYERS: 'g03_2014:ubahnhalte', TRANSPARENT: true, FORMAT: 'image/png'},
  })
});

var p_haltestellen = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {VERSION: '1.1.1', LAYERS: 'g03_2014:haltestellen', TRANSPARENT: true, FORMAT: 'image/png'},
  })
})

var p_uni = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {VERSION: '1.1.1', LAYERS: 'g03_2014:uni', TRANSPARENT: true, FORMAT: 'image/png'},
  })
})

var p_kindergarten = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {VERSION: '1.1.1', LAYERS: 'g03_2014:kindergarten', TRANSPARENT: true, FORMAT: 'image/png'},
  })
})

document.getElementById('punkt_ubahn').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(p_ubahn);
    }else{
      olMap.removeLayer(p_ubahn);
    }
  };
  
document.getElementById('punkt_haltestelle').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(p_haltestellen);
    }else{
      olMap.removeLayer(p_haltestellen);
    }
  };

document.getElementById('punkt_uni').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(p_uni);
    }else{
      olMap.removeLayer(p_uni);
    }
  };
  
document.getElementById('punkt_kindergarten').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(p_kindergarten);
    }else{
      olMap.removeLayer(p_kindergarten);
    }
  };
 
