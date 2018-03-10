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
 *     1. Redistributions of source code must retain the above copyright
 *        notice, this list of conditions and the following disclaimer.
 *     2. Redistributions in binary form must reproduce the above copyright
 *        notice, this list of conditions and the following disclaimer in the
 *        documentation and/or other materials provided with the distribution.
 *     3. Neither the name of the copyright holder nor the names of its
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

// The UI is created dynamically from a supplied array of objects.  Each array element specifies the configuration
// of an individual panel; you need to define at least one, and there is no upper limit.  The object has the
// following members:
//
// title :  Text displayed at the top of the panel
// url   :  The URL used to update the panel
// fields:  An array of objects specifying field configuration:
//             prop       : The property name present in the JSON response - also used in the HTML ID
//             label      : Text displayed in front of the value
//             suffix     : Text displayed after the value.  Optional.
//             thresholds : An optional object specifying warning and danger levels - used to drive visual feedback.
//                          Supports only numeric values, so if your data is text you'll have to map it to a number.
//                            warn   : The warning threshold
//                            danger : The danger threshold
//             showMax    : A boolean which specifies whether to display the largest recorded value for 'prop'.
//                          Assumes numeric values, so if your data is text you'll have to map it to a number.
//                          When set to true, the max value will appear as a separate field immediately beneath the
//                          field being tracked.

function RealtimeMonitor() {
   var PREFIX_MAX = "max",
       PREFIX_PANEL = "panel";

   var thresholds = [];
   var panelData = [];

   this.buildUI = function( appCfg ) {
      for( var i = 0; i < appCfg.length; i++ ) {
         var panelCfg = appCfg[i];

         var panelContainer = document.createElement( "div" );
         var title = document.createElement( "div" );
         var btnContainer = document.createElement( "div" );
         var btn = document.createElement( "button" );
         var btnValue = document.createTextNode( "Connect" );
         var graphContainer = document.createElement( "div" );
         var graphs = [];

         panelContainer.id = PREFIX_PANEL + i;
         panelContainer.className = "monitoringPanel";

         title.id = "title" + i;
         title.className = "title";
         title.appendChild( document.createTextNode(panelCfg.title) );

         panelContainer.appendChild( title );

         thresholds[i] = [];
         panelData[PREFIX_PANEL + i] = panelData[PREFIX_PANEL + i] || [];

         for( var j = 0; j < panelCfg.fields.length; j++ ) {
            var fieldCfg = panelCfg.fields[j];

            if( fieldCfg.thresholds ) {
               thresholds[i][fieldCfg.prop] = fieldCfg.thresholds;  // We need to refer to this part of the configuration after the UI is built, so save it
            }

            panelContainer.appendChild( newField(false, fieldCfg.prop, i, Boolean(fieldCfg.thresholds), fieldCfg.label, fieldCfg.suffix) );

            if( fieldCfg.showMax ) {
               panelContainer.appendChild( newField(true, fieldCfg.prop, i, Boolean(fieldCfg.thresholds), fieldCfg.label, fieldCfg.suffix) );
            }

            panelContainer.appendChild( newFieldSeparator() );
            panelData[PREFIX_PANEL + i][PREFIX_MAX + fieldCfg.prop] = 0;

            graphs.push( newGraph(fieldCfg.prop, i) );
         }

         graphContainer.className = "graphContainer";
         panelContainer.appendChild( graphContainer );

         btnContainer.className = "btnContainer";

         btn.id = "btn" + i;
         btn.addEventListener( "click", function(event) { btnClick( this ) } );
         btn.appendChild( btnValue );
         btnContainer.appendChild( btn );

         panelContainer.appendChild( btnContainer );

         for( var j = 0; j < graphs.length; j++ ) {
            graphContainer.appendChild( graphs[j] );
         }

         document.body.appendChild( panelContainer );

         function newField( isMax, propName, panelNum, hasThreshold, labelText, suffix ) {
            var fieldContainer = document.createElement( "div" );
            var status = document.createElement( "div" );
            var label = document.createElement( "label" );
            var val = document.createElement( "span" );

            fieldContainer.className = "fieldContainer";

            if( isMax ) {
               propName = PREFIX_MAX + propName;
               labelText = "Max " + labelText;
            } else {
               fieldContainer.className += " hasGraph";

               label.addEventListener( "click", function(event) {
                  showGraph( "graph" + this.getAttribute("for") );
               } );
            }

            status.id = "status" + propName + panelNum;  // Display color coding when there's an ID, otherwise keep the element for the sake of consistent indentation
            status.className = "status";
            fieldContainer.appendChild( status );

            val.id = propName + panelNum;

            label.setAttribute( "for", val.id );
            label.appendChild( document.createTextNode(labelText) );
            fieldContainer.appendChild( label );

            fieldContainer.appendChild( val );

            if( suffix ) {
               fieldContainer.appendChild( newSuffix(suffix, propName, panelNum) );
            }

            return fieldContainer;
         }

         function newSuffix( suffix, prop, panelNum ) {
            var elem = document.createElement( "span" );
            elem.id = "suffix" + prop + panelNum;
            elem.className = "hidden";
            elem.appendChild( document.createTextNode(suffix) );
            return elem;
         }

         function newFieldSeparator() {
            var separator = document.createElement( "div" );
            separator.className = "fieldSeparator";
            return separator;
         }

         function newGraph( propName, panelNum ) {
            var graph = document.createElement( "div" );

            graph.id = "graph" + propName + panelNum;
            graph.appendChild( document.createTextNode(graph.id) );

            return graph;
         }
      }
   };

   function showGraph( id ) {
      var graph = document.getElementById( id );
      var graphContainer = graph.parentNode;

      for( var i = 0; i < graphContainer.childNodes.length; i++ ) {
         graphContainer.childNodes[i].style.visibility = "hidden";
      }

      graph.style.visibility = "visible";
   }

   function btnClick( btn ) {
      var panelNum = btn.id.replace( "btn", "" );
      var connected = btn.innerHTML.indexOf( "Disconnect" ) !== -1;

      if( connected ) {
         disconnect( panelNum );
         btn.innerHTML = "Connect";
      } else {
         connect( panelNum );
         btn.innerHTML = "Disconnect";
      }
   }

   var simulator = null;

   function connect( panelNum ) {
      simulator = window.setInterval( function() {
         var jsonResponse = JSON.stringify( {
            load : random(50, 100),
            rpm  : random(1500, 2700),
            ambientTemp  : random(70, 75),
            internalTemp : random(175, 260),
            rhinocerous  : 45,  // unrecognized properties do not cause errors
            jsonXss      : "<img src=\"asdf\" onerror=\"alert('json xss')\" />", // see the XSS test in demo.html (second panel)
         } );

         updateStats( panelNum, jsonResponse );
         updateUI( panelNum );
      }, 1000 );

      function random( from, to ) {
         return Math.floor( Math.random() * (to - from + 1) ) + from;
      }
   }

   function disconnect( panelNum ) {
      window.clearInterval( simulator );
   }

   function updateStats( panelNum, jsonResponse ) {
      var panel = panelData[ PREFIX_PANEL + panelNum ];
      var stats = JSON.parse( jsonResponse );

      for( var prop in stats ) {
         var maxProp = PREFIX_MAX + prop;

         // Kind of a kludge.  To save on memory, the configuration passed to buildUI isn't saved, so we
         // use the presence of a "max" property to see if the property from the server is recognized.

         if( panel[maxProp] !== undefined ) {
            panel[prop] = stats[prop];
            panel[maxProp] = panel[maxProp] >= panel[prop] ? panel[maxProp] : panel[prop];
         }
      }
   }

   function updateUI( panelNum ) {
      var panelThresholds = thresholds[panelNum];
      var data = panelData[ PREFIX_PANEL + panelNum ];

      for( var prop in data ) {
         var thresholdProp = prop.replace( new RegExp("^" + PREFIX_MAX), "" );
         var value = data[prop];
         var field = document.getElementById( prop + panelNum );

         if( field != null ) {
            var className = "normal";
            var fieldThresholds = panelThresholds[thresholdProp];
            var status = document.getElementById( "status" + prop + panelNum );

            field.innerHTML = "";
            field.appendChild( document.createTextNode(value) );

            if( fieldThresholds ) {
               if( fieldThresholds.danger && value >= fieldThresholds.danger ) {
                  className = "danger";
               } else if( fieldThresholds.warn && value >= fieldThresholds.warn ) {
                  className = "warn";
               }
            }

            status.className = "status " + (fieldThresholds ? className : "none");

            var suffix = document.getElementById( "suffix" + prop + panelNum );

            if( suffix ) {
               suffix.className = "";  // make visible
            }
         }
      }
   }
}
