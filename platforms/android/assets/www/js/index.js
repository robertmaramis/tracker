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
        
        document.addEventListener("backbutton", function(e){
            if ($.mobile.activePage.attr('id') == 'loginPage' || $.mobile.activePage.attr('id') == 'homePage') {
                e.preventDefault();
                if (navigator.app) {
                    //navigator.app.exitApp();
                    return false;
                } else if (navigator.device) {
                    //navigator.device.exitApp();
                    return false;
                }
            }
            else {
                parent.history.back();
            }
        }, false);
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
        model = device.platform;
        
        setTimeout(function(){
            if (model=="iOS") {
                $("#header").addClass("ios");
                $(".ui-content").addClass("ios");
            }
        },100);
        
        //check login
        setTimeout(function(){
            var IS_LOGIN = window.localStorage.getItem("LOGIN_FLAG");
            if (IS_LOGIN=="YES"){
            
                $.mobile.changePage('homepage.html');
            } else {
                $.mobile.changePage('index.html');
            }
            $("#sideMenu").css('display','block');
        },500);
        
        /**
        * This callback will be executed every time a geolocation is recorded in the background.
        */
        
        //var bgGeo = navigator.plugins.backgroundGeoLocation;
 
        var callbackFn = function(location) {
            console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
        
            // Do your HTTP request here to POST location to your server. 
            // jQuery.post(url, JSON.stringify(location));
            handleGeoLocation(location.latitude,location.longitude);
            /*
            IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
            and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            */
            backgroundGeoLocation.finish();
            backgroundGeoLocation.start();
        };
        
        var failureFn = function(error) {
            console.log('BackgroundGeoLocation error');
        };
        
        
        backgroundGeoLocation.configure(callbackFn, failureFn, {
            desiredAccuracy: 10,
            stationaryRadius: 40,
            distanceFilter: 300,
            debug: false,
            stopOnTerminate: false,
            locationService: backgroundGeoLocation.service.ANDROID_FUSED_LOCATION
        });
    }
};

var watchID = null;
var watchPos = null;
var selectedJob = "";
var selectedId = "";
var geoLocationJSON=[];
var watchPos = new Interval(watchPosition, GEO_TIME_FOREGROUND);
var model = "";
var refreshFlag = false;
var loginFlag=false;

document.addEventListener("pause", function(){
    var jobStatus = window.localStorage.getItem("JOB_STATUS");
    if (jobStatus=="Y") {
        watchPos.stop();
        backgroundGeoLocation.start();    
    }
}, false);
document.addEventListener("resume", function(){
    var jobStatus = window.localStorage.getItem("JOB_STATUS");
    if (jobStatus=="Y") {
        watchPos.start();
        backgroundGeoLocation.stop();
    }
}, false);

$(document).ready(function () {
    $( "#sideMenu" ).enhanceWithin().panel();
    
    
    $("#loginForm input").keyup(function (e) {
        if (e.keyCode == 13) {
            $("#login").trigger("click");
            return false;
        }
    });
    
    $(document).on("click", "#login", function(event) {
    //$(document).on("submit", "#loginForm", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        var name = $("#userName").val();
        var pwd = $("#password").val();
        if (name == "") {
            showAlert(LOGIN_NAME_EMPTY);
            return false;
        } else if (pwd == "") {
            showAlert(LOGIN_PASSWORD_EMPTY);
            return false;
        } else {
            var data={
                name:name,
                password:pwd,
                from:"USER",
                mobile_code:HASH
            }
            USER_NAME=name;
            window.localStorage.setItem("USER_NAME",USER_NAME);
            USER_PASSWORD=pwd;
            callAjax("POST",LOGIN_URL,data,loginSuccess);
        }
    });
    
    $(document).on("click", ".menuIcon", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $("#userNameDisp").html(auth.getUserName);
        $("#sideMenu").panel( "open" );
    });
    
    $(document).on("click", ".backBtn", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $.mobile.back();
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
    
    //$(document).on("pageshow", "#homePage", function(event) {
        //pull to refresh
        //$("#toDoListContent").pullToRefresh({refresh: 70,resetSpeed:"600ms"})
        //.on("refresh.pulltorefresh", function (evt, y){
        //    console.log("GENEREATE TODO LIST");
        //    refreshFlag = true;
        //})
        //.on("end.pulltorefresh", function (evt){
        //    console.log("END PULL");
        //    if (refreshFlag) {
        //        console.log("CALLL AJAX");
        //        refreshFlag = false;
        //        var data = {
        //            name : auth.getUserName,
        //            mobile_code:HASH
        //        }
        //        callAjax("POST",TO_DO_LIST,data,generateTodolist);   
        //    }
        //});
    //});
    
    
    $(document).on("pageinit", "#aboutPage", function(event) {
        $(".appVersion").html(APP_VERSION);
    });
    
    $(document).on("pageshow", "#homePage", function(event) {
        if (loginFlag) {
            var data = {
                name : auth.getUserName,
                mobile_code:HASH
            }
            callAjax("POST",TO_DO_LIST,data,saveTodoList);
            loginFlag=false;
        } else {
            //generate todolist
            todolist.generate();
            
            //checkToDolistStatus
            todolist.checkStatus();
            setTimeout(function(){
                todolist.jobCheck();
                todolist.commentCheck();
            },300);
        }
        
        $(document).on("click", "#start", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            if ($(this).hasClass("stop")) {
                showAlert("You have completing your job");
                $(this).removeClass("stop").html("START");
                //$(this).fadeOut();
                // If you wish to turn OFF background-tracking, call the #stop method.
                //backgroundGeoLocation.stop();
                window.localStorage.setItem("JOB_STATUS","N");
                $(".checkIn").fadeOut();
                //$(".sync").fadeOut();
                watchPos.stop();
                //alert(geoLocationJSON);
            } else {
                //$(".disable").fadeOut();
                
                //make sure interval clear
                watchPos.stop();
                
                loading.show();
                watchPosition();
            }
        });
        
        $(document).on("click", ".checkIn", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            selectedJob = $(this).attr('id').split("_")[0];
            var compName = $("#"+selectedJob.split("_")[0]+"_toDoListItem .tdlTitle").text();
            showConfirm("Are you sure you want to checkin in "+compName+" ?","doCheckin");
            
            //checkin no need to check comment
            /*if(!todolist.isComment(selectedId)) {
                showAlert(COMMENT_NULL);
            }*/
        });
        
        $(document).on("click", ".doCheckin", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            var lat = "";
            var lng = "";
            
            loading.show();
            
            navigator.geolocation.getCurrentPosition(function(position){
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                
                
                var reverseGeocoder = new google.maps.Geocoder();
                var currentPosition = new google.maps.LatLng(lat, lng);
                reverseGeocoder.geocode({'latLng': currentPosition}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            address = results[0].formatted_address;        
                            console.log("GET ADDRESS=== " + address);
                            
                            var data = {
                                lat : lat,
                                lng : lng,
                                lease_no: selectedJob,
                                name: auth.getUserName,
                                address: address,
                                mobile_code:HASH
                            }
                            
                            callAjax("POST",CHECKIN,data,checkinSuccess);
                        }
                    }
                });
                
            });
        });
        
        $(document).on("click", ".toDoDetail", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            selectedId = $(this).parent().attr("id").split("_")[0];
            $.mobile.changePage("compDetail.html",{transition: "slide"});   
        });
        
        $(document).on("click", ".sync", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            var id = $(this).attr("id").split("_")[0];
            selectedId=id;
            
            var obj = window.localStorage.getItem(id+"_cmd");
            
            var commentObj = JSON.parse(obj);
            
            var data = {
                comment:commentObj.comment+"",
                lease_no:id,
                save_date:commentObj.time+"",
                mobile_code:HASH
            }
            
            callAjax("POST",SAVE_COMMENT,data,commentSubmitSuccess);
        });
    });
    
    $(document).on("click", "#track", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $(this).hide();
        $("#stop").show();
        //call for the automatic trigger
        watchPosition();
        /*var options = {frequency: 3000, enableHighAccuracy: false};
        watchID=navigator.geolocation.watchPosition(onSuccess, onError, options);*/
        watchPos.start();
    });
    $(document).on("click", "#stop", function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        $(this).hide();
        $("#track").show();
        watchPos.stop();
    });
    
    $(document).on("pageinit", "#companyDetailPage", function(event) {
        if (selectedId!=null) {
            var res = window.localStorage.getItem("TODOLIST");
            res =  JSON.parse(res);
            var restHtml="";
            for (var i=0;i<res.todolist.length;i++){
                var item = res.todolist[i];
                
                if (item.lease_no==selectedId) {
                    $(".todoTitle").html(item.cust_name);
                    $("#compAddres").html(item.address);
                    $("#compContractNo").html(item.lease_no);
                    $("#comptContactPerson").html(item.cust_name);
                    $("#compTel").html(item.phone_no);
                    $("#compUnit").html(item.unit);
                    $("#compEquipType").html(item.equip_type);
                    $("#compAmoutOD").html(item.amount_od);
                    $("#compJatuhTempo").html(item.due_date.date);
                    $("#compLastCall").html(item.last_call_date.date);
                    $("#compLastCallName").html(item.last_call_name);
                    $("#compLastNote").html(item.last_note);
                    
                    var commentObj = window.localStorage.getItem(selectedId+"_cmd");
                    if (commentObj!=null) {
                        var obj = $.parseJSON(commentObj);
                         $("#comment").val(obj.comment);
                    }
                }
            }
        }
        
        $(document).on("click", "#submitCompDet", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            var comment = $("#comment").val();
            var commentTmpStmp = moment().format('YYYY-MM-DD HH:mm:ss');
            var arr = {};
            arr.comment = comment;
            arr.time = commentTmpStmp;
            window.localStorage.setItem(selectedId+"_cmd",JSON.stringify(arr));
            
            var jobStatus = JSON.parse(window.localStorage.getItem(selectedId+"_STATUS"));
            jobStatus.comment ="NOT_SYNC";
            window.localStorage.setItem(selectedId+"_STATUS",JSON.stringify(jobStatus));
            
            showAlert(COMMAND_SAVE);
            loginFlag=true;
        });
        $(document).on("click", "#cancelCompDet", function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            $("#comment").val("");
            window.localStorage.removeItem(selectedId+"_cmd");
            
            var jobStatus = JSON.parse(window.localStorage.getItem(selectedId+"_STATUS"));
            jobStatus.comment ="NOT_COMMENT";
            window.localStorage.setItem(selectedId+"_STATUS",JSON.stringify(jobStatus));
            
            showAlert(COMMAND_REMOVE);
            loginFlag=true;
        });
    });
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

function checkinSuccess(res) {
    $("#"+selectedJob+"_toDoListItem").addClass("done");
    $("#"+selectedJob+"_toDoListItem .checkIn").fadeOut();
    $("#"+selectedJob+"_checkInIcon").css("display","block");
    
    var jobStatus = JSON.parse(window.localStorage.getItem(selectedJob+"_STATUS"));
    jobStatus.status ="DONE";
    window.localStorage.setItem(selectedJob+"_STATUS",JSON.stringify(jobStatus));
    
    /*if ($(this).hasClass("onGoing")) {
        $(this).removeClass("onGoing").hide();
    } else {
        $(this).addClass("onGoing").html("on Going");
    }*/
}

function watchPosition(){
    //navigator.geolocation.getCurrentPosition(function(position){});
    console.log("GETTING LOCATION");
    var options = { enableHighAccuracy: true, timeout: 10000};
    navigator.geolocation.getCurrentPosition(function(position){
        console.log("GETTING LOCATION INSIDE");
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var address="";
        console.log(lat+" "+lng);
        
        handleGeoLocation(lat,lng);
        
        window.localStorage.setItem("JOB_STATUS","Y");
        $("#start").addClass("stop").html("STOP");
        //$(".checkIn").fadeIn();
        //callTimer
        watchPos.start();
        
        //check all comment
        todolist.jobCheck();
        todolist.commentCheck();
        loading.hide();
    }, geoError,options);
}

function geoError(error) {
    console.log("LOCATION ERROR ==== " + error.code);
    if(error.code==1){
        loading.hide();
        showAlert(POSITION_ERROR);
    } else if (error.code ==3) {
        loading.hide();
        showAlert(POSITION_OFF);
    }
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
var idx = 1;
function onBackgroundSuccess(location) {
    console.log("BACGROUND SUCCESS " + idx + "lat= " + location.latitude + " lng= " + location.longitude);
    /*var R = 6371; // Radius of the earth in km
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
                        '<hr />'      + element.innerHTML;*/

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

function loginSuccess(res) {
    if (res.status==1) {
        //USER_BRANCH=res.branch;
        
        //set login cookie
        window.localStorage.setItem("LOGIN_FLAG","YES");
        loginFlag=true;
        $.mobile.changePage("homepage.html",{transition: "flip"});
    }
}

function generateTodolist(res) {
    if (res.status==1) {
        console.log(res);
        window.localStorage.setItem("TODOLIST",JSON.stringify(res));
        todolist.generate();
        
        setTimeout(function(){
            todolist.checkStatus();
            todolist.commentCheck();
        },300);
    }
}

function saveTodoList(res) {
    window.localStorage.setItem("TODOLIST",JSON.stringify(res));
    //generate todolist
    todolist.generate();
    
    //checkToDolistStatus
    todolist.checkStatus();
    todolist.jobCheck();
    todolist.commentCheck();
}

function logout() {
    window.localStorage.removeItem("LOGIN_FLAG");
    $.mobile.changePage("index.html",{transition: "flip"});   
}

var loading = {
    show: function() {
        if (!$("#loadingModal").is(":visible")) {
            console.log("LOADING IS VISIBLE");
            $("#loadingModal").modal();    
        }
        
    },
    hide: function() {
        $("#loadingModal").modal('hide');
    }
}

function callAjax(method,url,data,callback) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        crossDomain: true,
        timeout: AJAX_TIMEOUT_INT,
        beforeSend: function( xhr ) {
            /*$.mobile.loading( 'show', {
                text: LOADING_MESSAGE,
                textVisible: "true",
                theme: "a"
            });*/
            loading.show();
        },
        success: function (response) {
            if (PROFILE=="DEV") {
                response = $.parseJSON(response);   
            }
            console.log(response);
            if(response.status == 1) {
                callback(response);
            } else {
                $.mobile.loading('hide');
                showAlert(response.msg);
            }
            loading.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if(ajaxOptions === "timeout") {
                loading.hide();
                showAlert(AJAX_TIMEOUT);
            } else {
                loading.hide();
                showAlert(ajaxOptions);
            }
        }
    });
}

function callAjaxWithCallback(method,url,data,callback,errorCallback) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        crossDomain: true,
        async:true,
        timeout: AJAX_TIMEOUT_INT,
        beforeSend: function( xhr ) {
            /*$.mobile.loading( 'show', {
                text: LOADING_MESSAGE,
                textVisible: "true",
                theme: "a"
            });*/
            //loading.show();
        },
        success: function (response) {
            if (PROFILE=="DEV") {
                response = $.parseJSON(response);   
            }
            console.log(response);
            if(response.status == 1) {
                callback(response);
            } else {
                $.mobile.loading('hide');
                showAlert(response.msg);
            }
            //loading.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            errorCallback(data);
            //if(ajaxOptions === "timeout") {
            //    $.mobile.loading('hide');
            //    showAlert(AJAX_TIMEOUT);
            //} else {
            //    $.mobile.loading('hide');
            //    showAlert(ajaxOptions);
            //}
        }
    });
}

function trackSuccess(res) {
    console.log("TRACKING SUCCESS");
    
    window.localStorage.removeItem("PREV_COORD");
}

function retryTracking(data) {
    //alert(JSON.stringify(data));
    var arrayCoord = new Object();
    var arr = [];
    
    arrayCoord.lat = data.latitude;
    arrayCoord.lng = data.longitude;
    arrayCoord.recordTime = data.recordTime;
    arr.push(JSON.stringify(arrayCoord));
    
    window.localStorage.setItem("PREV_COORD",arr);
}

function handleGeoLocation(lat,lng) {
    var latlng=lat+','+lng;
    
    var reverseGeocoder = new google.maps.Geocoder();
    var currentPosition = new google.maps.LatLng(lat, lng);
    reverseGeocoder.geocode({'latLng': currentPosition}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                address = results[0].formatted_address;
                
                console.log(address);
    
                geoLocationJSON.push(latlng);
                var obj = new Object();
                var arrayCoord = new Object();
                var arr = [];

                //check previouse array
                var prevArr = window.localStorage.getItem("PREV_COORD");

                if (prevArr!=null && prevArr!= undefined && prevArr.size>0) {
                    console.log(prevArr);
                    arr.push(prevArr);
                }

                arrayCoord.lat = lat;
                arrayCoord.lng = lng;
                arrayCoord.recordTime = moment().format('YYYY-MM-DD HH:mm:ss');
                arrayCoord.address = address;
                arr.push(arrayCoord);

                //alert(JSON.stringify(arr));

                obj.coord = arr;
                obj = JSON.stringify(obj);

                //alert(obj);
                //test
                
                var data={
                    name:auth.getUserName,
                    password:auth.getUserPassword,
                    coord: obj,
                    mobile_code:HASH
                }
                callAjaxWithCallback("POST",TRACK,data,trackSuccess,retryTracking);
            } else {
                console.log('Unable to detect your address.');
            }
        } else {
            console.log('Unable to detect your address.');
        }
    });
}

var todolist = {
    generate: function(){
        var res = window.localStorage.getItem("TODOLIST");
        res =  JSON.parse(res);
        var restHtml="";
        
        if (res.todolist.length>0) {
            restHtml+="<ul>";
            for (var i=0;i<res.todolist.length;i++){
                var items = res.todolist[i];
                var todolistStatus = "";
                var jobStatus = items.lease_no+"_STATUS";
                var commandStatus = window.localStorage.getItem(items.lease_no+"_cmd");
                var checkIn = "";
                //set job status
                //var checkLocalJobStat = window.localStorage.getItem(jobStatus);
                //if (checkLocalJobStat==null) {
                    var status = {};
                    if (res.todolist[i].check_in=="0") {
                        status.status = "NOT_STARTED";
                    } else {
                        status.status = "DONE";
                        todolistStatus = "done";
                    }
                    
                    if (res.todolist[i].sync=="1") {
                        status.comment = "SYNC";
                    } else {
                        if (commandStatus!=null || commandStatus!= undefined) {
                            status.comment = "NOT_SYNC";
                        } else {
                            status.comment = "NOT_COMMENT";
                        }
                    }
                    
                    window.localStorage.setItem(jobStatus,JSON.stringify(status));
                //}
                
                restHtml+='<li id="'+items.lease_no+'_toDoListItem" class="toDoListItem '+todolistStatus+'">'+
                          '   <div class="toDoDetail">'+
                          '          <div class="tdlTitle">'+items.cust_name+'</div>'+
                          '          <div class="tdlDetail">'+
                                        items.address+'<br/>Telp:<a href="tel:'+items.phone_no+'">'+items.phone_no+'</a>'+
                          '          </div>'+
                          '      </div>'+
                          '      <!--<div id="id" class="checkinJob" idx="0">Check in</div>'+
                          '      <div id="0_doneIco" class="doneIco"><i class="fa fa-check fa-2x"></i></div>-->'+
                          '      <div class="toDoActionDiv">'+
                          '         <div id="'+items.lease_no+'_checkInIcon" class="doneJob toDoAction"><i class="fa fa-flag-checkered fa-2x" aria-hidden="true"></i></div>'+
                          '         <div id="'+items.lease_no+'_checkIn" class="checkIn toDoAction"><i class="fa fa-check-square-o fa-2x"></i></div>'+
                          '         <div id="'+items.lease_no+'_sync" class="sync toDoAction"><i class="fa fa-random fa-2x"></i></div>'+
                          '      </div>'+
                          '      <div class="clearfix"></div>'+
                          '  </li>';
            }
            restHtml+="</ul>";
            $(".todoContent").html(restHtml);
        } else {
            restHtml = "<div class='noTodo'>No Todo list for today</div>";
            $(".todoContent").html(restHtml);
        }
    },
    checkStatus : function(){
        var status = window.localStorage.getItem("JOB_STATUS");
        if (status=="Y") {
            $("#start").addClass("stop").html("STOP");
            //relauch timer
            watchPos.start();
            
            //check job status
            todolist.jobCheck();
        }
    },
    jobCheck : function(){
        var res = window.localStorage.getItem("TODOLIST");
        var status = window.localStorage.getItem("JOB_STATUS");
        res =  JSON.parse(res);
        for (var i=0;i<res.todolist.length;i++){
            var jobStatus = window.localStorage.getItem(res.todolist[i].lease_no+"_STATUS");
            jobStatus = JSON.parse(jobStatus);
            if (jobStatus.status=="DONE" || res.todolist[i].check_in == "1") {
                $("#"+res.todolist[i].lease_no+"_toDoListItem").addClass("done");
                $("#"+res.todolist[i].lease_no+"_checkInIcon").fadeIn();
                $("#"+res.todolist[i].lease_no+"_checkIn").fadeOut();
            } else if (jobStatus.status=="NOT_STARTED") {
                if (status == "Y") {
                    $("#"+res.todolist[i].lease_no+"_checkIn").fadeIn();
                }
            } 
            
            if (jobStatus.comment=="NOT_COMMENT") {
                $("#"+res.todolist[i].lease_no+"_sync").fadeOut();
            } else if (jobStatus.comment=="NOT_SYNC") {
                $("#"+res.todolist[i].lease_no+"_sync").fadeIn();
            } else if (jobStatus.comment=="SYNC") {
                $("#"+res.todolist[i].lease_no+"_sync").fadeOut();
            }
        }
    },
    commentCheck : function(){
        //notuse
        var res = window.localStorage.getItem("TODOLIST");
        var status = window.localStorage.getItem("JOB_STATUS");
        res =  JSON.parse(res);
        for (var i=0;i<res.todolist.length;i++){
            var jobStatus = window.localStorage.getItem(res.todolist[i].lease_no+"_STATUS");
            jobStatus = JSON.parse(jobStatus);
            
            if (status=="Y") {
                if (jobStatus.comment=="NOT_COMMENT") {
                    $("#"+res.todolist[i].lease_no+"_sync").fadeOut();
                } else if (jobStatus.comment=="NOT_SYNC") {
                    $("#"+res.todolist[i].lease_no+"_sync").fadeIn();
                } else if (jobStatus.comment=="SYNC") {
                    $("#"+res.todolist[i].lease_no+"_sync").fadeOut();
                }
            }
            
            //var comment = window.localStorage.getItem(res.todolist[i].lease_no+"_cmd");
            //if (comment!="" && comment!=undefined && status=="Y") {        
            //    $("#"+res.todolist[i].lease_no+"_sync").fadeIn();
            //}
        }
    },
    isComment : function(id){
        var comment = window.localStorage.getItem(id+"_cmd");
        if (comment!=null) {
            return true;
        }
        return false;
    }
}

var auth = {
    getUserName : function(){
        if(USER_NAME==null || USER_NAME==""){
            USER_NAME = window.localStorage.getItem("USER_NAME");
        }
        return USER_NAME;
    },
    getUserPassword : function(){
        if(USER_PASSWORD==null || USER_PASSWORD==""){
            USER_PASSWORD = window.localStorage.getItem("USER_PASSWORD");
        }
        return USER_PASSWORD;
    }
}

function Interval(fn, time) {
    var timer = false;
    this.start = function () {
        if (!this.isRunning())
            timer = setInterval(fn, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}

function commentSubmitSuccess(res) {
    
    $("#"+selectedId+"_sync").fadeOut();
    var jobStatus = window.localStorage.getItem(selectedId+"_STATUS");
    
    jobStatus = JSON.parse(jobStatus);
    jobStatus.comment = "SYNC";
    window.localStorage.setItem(selectedId+"_STATUS",JSON.stringify(jobStatus));
    window.localStorage.removeItem(selectedId+"_cmd");
    $("#comment").val("");
    
    showConfirm(COMMENT_SUCCESS,goBack);
}

function goBack() {
    parent.history.back();
}