import * as shell from "shelljs";

shell.exec("browserify dist/events/LoginScript.js > dist/events/LoginScriptBundled.js");
shell.exec("browserify dist/events/RegisterScript.js > dist/events/RegisterScriptBundled.js");
shell.exec("browserify dist/events/AccountScript.js > dist/events/AccountScriptBundled.js");
shell.exec("browserify dist/events/ForgotPasswordScript.js > dist/events/ForgotPasswordScriptBundled.js");
shell.exec("browserify dist/events/ResetPasswordScript.js > dist/events/ResetPasswordScriptBundled.js");