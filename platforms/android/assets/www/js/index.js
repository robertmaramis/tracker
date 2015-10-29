/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};
var watchID = null;
var watchPos = null;
var selectedJob = "";

$(document).ready(function () {
    $( "#sideMenu" ).enhanceWithin().panel();
    var model = getDeviceType();
    
    if (model =="iOS") {
        $(".iosHeader").css("display","block");
    }
    $(document).on("click", "#login", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        var name = $("#userName").val();
        var pwd = $("#password").val();
        if (name == "") {
            showAlert("Please fill your user name");
        } else if (pwd == "") {
            showAlert("Please fill your user password");
        } else {
            $.mobile.changePage("homepage.html",{transition: "flip"});
        }
    });
    
    $(document).on("click", ".menuIcon", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $("#sideMenu").panel( "open" );
    });
    
    $(document).on("click", ".sideBarMenus", function(event) {
        var parent = $(this).attr('id');
        console.log(parent);
        if (parent == "toDoListSB") {
            $.mobile.changePage("homepage.html",{transition: "slide"});
        } else if (parent == "profileSB") {
            $.mobile.changePage("profile.html",{transition: "slide"});
        } else if (parent == "aboutSB") {
            $.mobile.changePage("about.html",{transition: "slide"});
        } else if (parent == "closeSB") {
            $("#sideMenu").panel("close");
        } else if (parent == "logoutSB") {
            logout();
        }
    });
    
    $(document).on("pageinit", "#homePage", function(event) {
        $(document).on("click", "#start", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            if ($(this).hasClass("stop")) {
                showAlert("You have completing your job");
                $(this).fadeOut();
            } else {
                $(".disable").fadeOut();
                $(this).addClass("stop").html("STOP");    
            }
        });
        
        $(document).on("click", ".checkinJob", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            selectedJob = $(this).attr('idx');
            showConfirm("Are you sure you want to checkin here?","doCheckin");
        });
        
        $(document).on("click", ".doCheckin", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            checkin();
        });
    });
    
    $(document).on("click", "#track", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $(this).hide();
        $("#stop").show();
        watchPosition();
        /*var options = {frequency: 3000, enableHighAccuracy: false};
        watchID=navigator.geolocation.watchPosition(onSuccess, onError, options);*/
        watchPos = setInterval(function(){watchPosition()}, 10000);
    });
    $(document).on("click", "#stop", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $(this).hide();
        $("#track").show();
        clearInterval(watchPos);
        //navigator.geolocation.clearWatch(watchID);
    });
    
    //bgGeo.start();
});

// onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//
function onSuccess(position) {
    var element = document.getElementById('geolocation');
    element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                        'Longitude: ' + position.coords.longitude     + '<br />' +
                        '<hr />'      + element.innerHTML;
    console.log(position.coords.latitude+"-"+position.coords.longitude);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function checkin() {
    $("#"+selectedJob+"_toDoListItem").addClass("done");
    $("#"+selectedJob+"_toDoListItem .checkinJob").fadeOut();
    $("#"+selectedJob+"_doneIco").fadeIn();
    /*if ($(this).hasClass("onGoing")) {
        $(this).removeClass("onGoing").hide();
    } else {
        $(this).addClass("onGoing").html("on Going");
    }*/
}

function watchPosition(){
    navigator.geolocation.getCurrentPosition(function(position){
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var streetNumber="";
        var route="";
        var neighborhood="";
        var locality="";
        var country="";
        var postalCode="";
        var formattedAddress="";
        console.log(lat+" "+lng);
        $.ajax({
            type: "GET",
            url: "http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=true",
            timeout: 30000,
            async: true,
            beforeSend: function( xhr ) {
                $.mobile.loading( 'show', {
                    textVisible: "false",
                    theme: "a"
                });
            },
            success: function (response) {
                res = response;
                console.log(JSON.stringify(res));
                var comp = res.results[0].address_components;
                formattedAddress = res.results[0].formatted_address;
                for(var i=0;i<comp.length;i++){
                    if (comp[i].types=="street_number") {
                        streetNumber = comp[i].long_name;
                        console.log(comp[i].long_name);
                    } else if (comp[i].types=="route") {
                        route=comp[i].long_name;
                        console.log(comp[i].long_name);
                    } else if ($.inArray("neighborhood",comp[i].types)!=-1) { //array
                        neighborhood=comp[i].long_name;
                        console.log(comp[i].long_name);
                    } else if ($.inArray("locality",comp[i].types)!=-1) { //array
                        locality=comp[i].long_name;
                        console.log(comp[i].long_name);
                    } else if (comp[i].types=="country") {
                        country=comp[i].long_name;
                        console.log(comp[i].long_name);
                    } else if (comp[i].types=="postal_code") {
                        postalCode=comp[i].long_name;
                        console.log(comp[i].long_name);
                    }
                }
                //sendLocation(streetNumber,route,neighborhood,locality,country,postalCode,lat,lng,formattedAddress);
                var resHtml ='Latitude: '  + position.coords.latitude      + '<br />' +
                                'Longitude: ' + position.coords.longitude     + '<br />' +
                                'Address: ' + formattedAddress +'<br />'+
                                '<hr />';
                $.mobile.loading('hide');
                $("#geolocation").append(resHtml);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if(ajaxOptions === "timeout") {
                    $.mobile.loading('hide');
                    console.log("GEO LOCATION TIMEOUT");
                } else {
                    $.mobile.loading('hide');
                    console.log("GEO LOCATION ERROR");
                }
            }
        });
    }, onError);
}

/*var polyline = new GPolyline([
  new GLatLng(37.4419, -122.1419),
  new GLatLng(37.4519, -122.1519)],
  "#ff0000", 10);
map.addOverlay(polyline);

var bgGeo = navigator.plugins.backgroundGeoLocation;
 
var callbackFn = function(location){
    runtap.util.gps.onBackgroundSuccess(location);
};
 
var failureFn = function(error){
    alert('Geolocation Error');
};
 
bgGeo.configure(callbackFn, failureFn, {
    desiredAccuracy: 10,
    stationaryRadius: 10,
    distanceFilter: 30,
    debug: true
});*/

function onBackgroundSuccess(location) {
 
    var R = 6371; // Radius of the earth in km
    var dLat = (location.latitude-this.lastLatitude) * (Math.PI/180);  // deg2rad below
    var dLon = (location.longitude-this.lastLongitude) * (Math.PI/180);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.lastLatitude * (Math.PI/180)) * Math.cos(location.latitude * (Math.PI/180)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distance = R * c; // Distance in km
    this.lastLatitude = location.latitude;
    this.lastLongitude = location.longitude;
 
    //Set timer HTML to total distance
    var tracker = Ext.ComponentQuery.query("timer #gps")[0];
    var value = Math.round(runtap.globals.totalDistance * 100) / 100;
    tracker.setHtml(value + "<span style = 'font-size: 18px;'>km</span>");
    
    var element = document.getElementById('geolocation');
    element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                        'Longitude: ' + position.coords.longitude     + '<br />' +
                        '<hr />'      + element.innerHTML;
 
};

/**
 * Determine the mobile operating system.
 * This function either returns 'iOS', 'Android' or 'unknown'
 *
 * @returns {String}
 */
function getDeviceType() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
    if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
    {
      return 'iOS';
  
    }
    else if( userAgent.match( /Android/i ) )
    {
  
      return 'Android';
    }
    else
    {
      return 'unknown';
    }
};

function showAlert(content) {
    var restHtml= '     <div class="modal-dialog modal-sm">'+
                   '       <div class="modal-content">'+
                   '         <div class="modal-header">'+
                   '           <h4 class="modal-title">Mitsui Leasing</h4>'+
                   '         </div>'+
                   '         <div class="modal-body">'+
                   '           <p>'+content+'</p>'+
                   '         </div>'+
                   '         <div class="modal-footer">'+
                   '           <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                   '         </div>'+
                   '       </div>'+        
                   '     </div>';
    $("#mainModal").html(restHtml);
    $("#mainModal").modal('show');
}

function showConfirm(content,callback) {
    var restHtml= '     <div class="modal-dialog modal-sm">'+
                   '       <div class="modal-content">'+
                   '         <div class="modal-header">'+
                   '           <h4 class="modal-title">Mitsui Leasing</h4>'+
                   '         </div>'+
                   '         <div class="modal-body">'+
                   '           <p>'+content+'</p>'+
                   '         </div>'+
                   '         <div class="modal-footer">'+
                   '           <button type="button" class="'+callback+' btn btn-default" data-dismiss="modal">Ok</button>'+
                   '           <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                   '         </div>'+
                   '       </div>'+        
                   '     </div>';
    $("#mainModal").html(restHtml);
    $("#mainModal").modal('show');
}

function logout() {
    $.mobile.changePage("index.html",{transition: "flip"});   
}