var PROFILE="DEV",
SECRET="mitsui",
CODE="!@#$AppTracker*&^%",
HASH = CryptoJS.SHA1(CryptoJS.SHA1(SECRET)+CODE)+"",
AJAX_TIMEOUT_INT=60000,
GEO_TIME_FOREGROUND=900000,
AJAX_TIMEOUT="Failed connect to server, please try again later",
LOADING_MESSAGE="Please wait while your request is being process",
USER_EMAIL="",
USER_PASSWORD="",
USER_NAME="",
USER_BRANCH="";
APP_VERSION="1.1";

//ERROR MESSAGE
var
LOGIN_NAME_EMPTY="Please fill your user name",
LOGIN_PASSWORD_EMPTY="Please fill your user password",
COMMAND_SAVE="Your command have been save, please sycn to the server on to-do list page.",
COMMAND_REMOVE="Your command have been remove",
COMMENT_NULL="You Need to fill comment first",
COMMENT_SUCCESS="Comment successfully submit",
POSITION_OFF="Please enable your location service on your device settings",
POSITION_ERROR="Error when getting your location, please try again later";

if (PROFILE=="DEV") {
    var
    BASE_URL        ="",
    LOGIN_URL       =BASE_URL+"https://dl.dropboxusercontent.com/u/22201907/appTracker/USER/login.json",
    TRACK           =BASE_URL+"https://dl.dropboxusercontent.com/u/22201907/appTracker/USER/successComent.json",
    SAVE_COMMENT    =BASE_URL+"https://dl.dropboxusercontent.com/u/22201907/appTracker/USER/successComent.json",
    CHECKIN         =BASE_URL+"https://dl.dropboxusercontent.com/u/22201907/appTracker/USER/successComent.json",
    TO_DO_LIST      =BASE_URL+"https://dl.dropboxusercontent.com/u/22201907/appTracker/USER/todolist.json";
} else {
    var
    BASE_URL        ="http://114.4.147.113",
    LOGIN_URL       =BASE_URL+"/mitsui/index.php/login_user",
    TRACK           =BASE_URL+"/mitsui/index.php/tracker",
    SAVE_COMMENT    =BASE_URL+"/mitsui/index.php/save_comment",
    CHECKIN         =BASE_URL+"/mitsui/index.php/check_in",
    TO_DO_LIST      =BASE_URL+"/mitsui/index.php/todolist";
}