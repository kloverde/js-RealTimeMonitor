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
   const CLASS_MONITORING_PANEL = "monitoringPanel",
         CLASS_TITLEBAR         = "titleBar",
         CLASS_FIELD_CONTAINER  = "fieldContainer",
         CLASS_FIELDS_CONTAINER = "fieldsContainer",
         CLASS_GRAPH_CONTAINER  = "graphContainer",
         CLASS_CONNECT_BTN_CONTAINER = "btnConnectContainer",
         CLASS_HAS_GRAPH        = "hasGraph",
         CLASS_HIDDEN           = "hidden",
         CLASS_FIELD_SEPARATOR  = "fieldSeparator",
         CLASS_MINIMIZED        = "minimized",
         CLASS_STATUS           = "status",
         CLASS_STATUS_NORMAL    = "normal",
         CLASS_STATUS_WARN      = "warn",
         CLASS_STATUS_DANGER    = "danger",
         CLASS_STATUS_NONE      = "none";

   const PREFIX_MAX = "max",
         PREFIX_PANEL = "panel";

   var thresholds = [];
   var panelData = [];

   this.buildUI = function( appCfg ) {
      for( var i = 0; i < appCfg.length; i++ ) {
         var panelCfg = appCfg[i];

         var panel = document.createElement( "div" );
         var titleBar = document.createElement( "div" );
         var btnMinMax = document.createElement( "button" );
         var fieldsContainer = document.createElement( "div" );
         var btnConnectContainer = document.createElement( "div" );
         var btnConnect = document.createElement( "button" );
         var graphContainer = document.createElement( "div" );
         var graphs = [];

         panel.id = PREFIX_PANEL + i;
         panel.className = CLASS_MONITORING_PANEL;

         titleBar.id = "title" + i;
         titleBar.className = CLASS_TITLEBAR;
         titleBar.appendChild( document.createTextNode(panelCfg.title) );

         btnMinMax.id = "btnMinMax" + i;
         btnMinMax.innerHTML = "-";
         btnMinMax.addEventListener( "click", function(event) { minimizeMaximize( this.id.replace("btnMinMax", "") ); } );
         titleBar.appendChild( btnMinMax );

         panel.appendChild( titleBar );

         thresholds[i] = [];
         panelData[PREFIX_PANEL + i] = panelData[PREFIX_PANEL + i] || [];

         fieldsContainer.className = CLASS_FIELDS_CONTAINER;

         for( var j = 0; j < panelCfg.fields.length; j++ ) {
            var fieldCfg = panelCfg.fields[j];

            if( fieldCfg.thresholds ) {
               thresholds[i][fieldCfg.prop] = fieldCfg.thresholds;  // We need to refer to this part of the configuration after the UI is built, so save it
            }

            fieldsContainer.appendChild( newField(false, fieldCfg.prop, i, Boolean(fieldCfg.thresholds), fieldCfg.label, fieldCfg.suffix) );

            if( fieldCfg.showMax ) {
               fieldsContainer.appendChild( newField(true, fieldCfg.prop, i, Boolean(fieldCfg.thresholds), fieldCfg.label, fieldCfg.suffix) );
            }

            fieldsContainer.appendChild( newFieldSeparator() );
            panelData[PREFIX_PANEL + i][PREFIX_MAX + fieldCfg.prop] = 0;

            graphs.push( newGraph(fieldCfg.prop, i) );
         }

         graphContainer.className = CLASS_GRAPH_CONTAINER;

         panel.appendChild( fieldsContainer );
         panel.appendChild( graphContainer );

         btnConnectContainer.className = CLASS_CONNECT_BTN_CONTAINER;

         btnConnect.id = "btnConnect" + i;
         btnConnect.addEventListener( "click", function(event) { connectBtnClick( this ); } );
         btnConnect.appendChild( document.createTextNode("Connect") );
         btnConnectContainer.appendChild( btnConnect );

         panel.appendChild( btnConnectContainer );

         for( var j = 0; j < graphs.length; j++ ) {
            graphContainer.appendChild( graphs[j] );
         }

         document.body.appendChild( panel );

         function newField( isMax, propName, panelNum, hasThreshold, labelText, suffix ) {
            var fieldContainer = document.createElement( "div" );
            var status = document.createElement( "div" );
            var label = document.createElement( "label" );
            var val = document.createElement( "span" );

            fieldContainer.className = CLASS_FIELD_CONTAINER;

            if( isMax ) {
               propName = PREFIX_MAX + propName;
               labelText = "Max " + labelText;
            } else {
               fieldContainer.classList.add( CLASS_HAS_GRAPH );

               label.addEventListener( "click", function(event) {
                  showGraph( "graph" + this.getAttribute("for") );
               } );
            }

            status.id = "status" + propName + panelNum;  // Display color coding when there's an ID, otherwise keep the element for the sake of consistent indentation
            status.className = CLASS_STATUS;
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
            elem.className = CLASS_HIDDEN;
            elem.appendChild( document.createTextNode(suffix) );
            return elem;
         }

         function newFieldSeparator() {
            var separator = document.createElement( "div" );
            separator.className = CLASS_FIELD_SEPARATOR;
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

   function minimizeMaximize( panelNum ) {
      var panel = document.getElementById( "panel" + panelNum ),
          btn   = document.getElementById( "btnMinMax" + panelNum );

      if( panel.classList.contains(CLASS_MINIMIZED) ) {
         panel.classList.remove( CLASS_MINIMIZED );
         btn.innerHTML = "-";
      } else {
         panel.classList.add( CLASS_MINIMIZED );
         btn.innerHTML = "+";
      }
   }

   function showGraph( id ) {
      var graph = document.getElementById( id );
      var graphContainer = graph.parentNode;

      for( var i = 0; i < graphContainer.childNodes.length; i++ ) {
         graphContainer.childNodes[i].style.visibility = "hidden";
      }

      graph.style.visibility = "visible";
   }

   function connectBtnClick( btn ) {
      var panelNum = btn.id.replace( "btnConnect", "" );
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
      }, 2000 );

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

      var titleBar = document.getElementById( "title" + panelNum );

      var anyWarn = false,
          anyDanger = false;

      for( var prop in data ) {
         var thresholdProp = prop.replace( new RegExp("^" + PREFIX_MAX), "" );
         var value = data[prop];
         var field = document.getElementById( prop + panelNum );

         if( field != null ) {
            var isMaxField = field.id.indexOf( PREFIX_MAX ) === 0;
            var className = CLASS_STATUS_NORMAL;
            var fieldThresholds = panelThresholds[thresholdProp];
            var fieldStatus = document.getElementById( "status" + prop + panelNum );

            field.innerHTML = "";
            field.appendChild( document.createTextNode(value) );

            if( fieldThresholds ) {
               if( fieldThresholds.danger && value >= fieldThresholds.danger ) {
                  className = CLASS_STATUS_DANGER;

                  if( !isMaxField ) {
                     anyDanger = true;
                  }
               } else if( fieldThresholds.warn && value >= fieldThresholds.warn ) {
                  className = CLASS_STATUS_WARN;

                  if( !isMaxField ) {
                     anyWarn = true;
                  }
               }
            }

            fieldStatus.classList.remove( CLASS_STATUS_NORMAL );
            fieldStatus.classList.remove( CLASS_STATUS_WARN );
            fieldStatus.classList.remove( CLASS_STATUS_DANGER );

            fieldStatus.classList.add( fieldThresholds ? className : CLASS_STATUS_NONE );

            var suffix = document.getElementById( "suffix" + prop + panelNum );

            if( suffix ) {
               suffix.classList.remove( CLASS_HIDDEN );
            }
         }
      }

      titleBar.classList.remove( CLASS_STATUS_NORMAL );
      titleBar.classList.remove( CLASS_STATUS_WARN );
      titleBar.classList.remove( CLASS_STATUS_DANGER );

      if( anyDanger ) {
         titleBar.classList.add( CLASS_STATUS_DANGER );
      } else if( anyWarn ) {
         titleBar.classList.add( CLASS_STATUS_WARN );
      } else {
         titleBar.classList.add( CLASS_STATUS_NORMAL );
      }
   }
}
