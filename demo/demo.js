/*
 * RealtimeMonitor
 * https://www.github.com/kloverde/js-RealtimeMonitor
 *
 * Copyright (c) 2018, Kurtis LoVerde
 * All rights reserved.
 *
 * Donations:  https://paypal.me/KurtisLoVerde/5
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     1. This software may not be used by any for-profit entity, whether a
 *        business, person, or other, or for any for-profit purpose.
 *     2. Redistributions of source code must retain the above copyright
 *        notice, this list of conditions and the following disclaimer.
 *     3. Redistributions in binary form must reproduce the above copyright
 *        notice, this list of conditions and the following disclaimer in the
 *        documentation and/or other materials provided with the distribution.
 *     4. Neither the name of the copyright holder nor the names of its
 *        contributors may be used to endorse or promote products derived from
 *        this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

let configuration = [ {
   title  : "GET Demo",
   url    : { address  : "http://localhost:8080/status/site1",
              method   : "GET",
              interval : 3 },
   autoConnect    : true,
   startMinimized : false,
   notifications  : false,
   fields : [
               { prop : "load", label : "Load", suffix : "%", highThresholds : { warn : 70, danger : 90 }, showLowest : true, showHighest : true },
               { prop : "rpm", label : "RPM",  lowThresholds : { warn : 500, danger : 300 }, highThresholds : { warn : 2000, danger : 2500 }, showLowest : true, showHighest : true },
               { prop : "ambientTemp", label : "Ambient Temp", suffix : "°F", showLowest : false, showHighest : false },
               { prop : "internalTemp", label : "Internal Temp", suffix : "°F", highThresholds : { warn : 200, danger : 250 }, showHighest : true }
            ]
},

{
   title  : "POST Demo",
   url    : { address  : "http://localhost:8080/status",
              method   : "POST",
              postData : { site : "site2", otherStuff : "more_stuff" },
              interval : 3 },
   autoConnect    : true,
   startMinimized : false,
   notifications  : false,
   fields : [
               { prop : "load", label : "Load", suffix : "%", highThresholds : { warn : 70, danger : 90 }, showLowest : true, showHighest : true },
               { prop : "rpm", label : "RPM",  lowThresholds : { warn : 500, danger : 300 }, highThresholds : { warn : 2000, danger : 2500 }, showLowest : true, showHighest : true },
               { prop : "ambientTemp", label : "Ambient Temp", suffix : "°F", showLowest : false, showHighest : false },
               { prop : "internalTemp", label : "Internal Temp", suffix : "°F", highThresholds : { warn : 200, danger : 250 }, showHighest : true }
            ]
},
/*
{
   title  : "Web Socket Demo",
   url    : "http://localhost/RealtimeMonitor/status/site1",
   autoConnect    : true,
   startMinimized : false,
   notifications  : false,
   fields : [
               { prop : "load", label : "Load", suffix : "%", highThresholds : { warn : 70, danger : 90 }, showLowest : true, showHighest : true },
               { prop : "rpm", label : "RPM",  lowThresholds : { warn : 500, danger : 300 }, highThresholds : { warn : 2000, danger : 2500 }, showLowest : true, showHighest : true },
               { prop : "ambientTemp", label : "Ambient Temp", suffix : "°F", showLowest : false, showHighest : false },
               { prop : "internalTemp", label : "Internal Temp", suffix : "°F", highThresholds : { warn : 200, danger : 250 }, showHighest : true }
            ]
}

// You'll have to deactivate the visibilityHidden class to observe the XSS3 test, as suffixes are hidden until the 'Connect' button is clicked

,{
   title  : "Test XSS Attacks <img src=\"asdf\" onerror=\"alert('xss1')\" />",
   url    : "http://localhost/RealtimeMonitor/status/site1",
   fields : [
               { prop : "xss2", label : "XSS 2: <img src=\"asdf\" onerror=\"alert('xss2')\" />", suffix : "suffix", showHighest : false },
               { prop : "xss3", label : "XSS 3: ", suffix : "suffix <img src=\"asdf\" onerror=\"alert('xss3')\" />", showHighest : false },
               { prop : "jsonXss", label : "JSON XSS Test (click 'Connect'): ", showHighest : false }
            ]
}
*/
];

document.addEventListener( "DOMContentLoaded", function() {
   const monitor = new RealtimeMonitor();
   monitor.initialize( configuration );
   configuration = undefined;
} );
