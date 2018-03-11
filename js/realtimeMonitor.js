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

function RealtimeMonitor() {
   const CLASS_MONITORING_PANEL      = "monitoringPanel",
         CLASS_TITLEBAR              = "titleBar",
         CLASS_FIELD_CONTAINER       = "fieldContainer",
         CLASS_FIELDS_CONTAINER      = "fieldsContainer",
         CLASS_GRAPH_CONTAINER       = "graphContainer",
         CLASS_CONNECT_BTN_CONTAINER = "btnConnectContainer",
         CLASS_HAS_GRAPH             = "hasGraph",
         CLASS_VISIBILITY_HIDDEN     = "visibilityHidden",
         CLASS_VISIBILITY_GONE       = "visibilityGone",
         CLASS_FIELD_SEPARATOR       = "fieldSeparator",
         CLASS_MINIMIZED             = "minimized",
         CLASS_STATUS                = "status",
         CLASS_STATUS_NORMAL         = "normal",
         CLASS_STATUS_WARN           = "warn",
         CLASS_STATUS_DANGER         = "danger",
         CLASS_STATUS_NONE           = "none";

   const ID_STUB_PANEL               = "monitoringPanel",
         ID_STUB_TITLE               = "title",
         ID_STUB_MIN_MAX_BUTTON      = "btnMinMax",
         ID_STUB_CONNECT_BUTTON      = "btnConnect",
         ID_STUB_GRAPH               = "graph",
         ID_STUB_STATUS              = "status",
         ID_STUB_SUFFIX              = "suffix";

   const TEXT_BUTTON_MINIMIZE        = "-",
         TEXT_BUTTON_MAXIMIZE        = "+",
         TEXT_BUTTON_CONNECT         = "Connect",
         TEXT_BUTTON_DISCONNECT      = "Disconnect",
         TEXT_LABEL_HIGHEST          = "Highest",
         TEXT_LABEL_LOWEST           = "Lowest";

   const PROP_STUB_HIGHEST = "highest",
         PROP_STUB_LOWEST  = "lowest";

   let settings = {};  // This is a subset of the configuration passed into initialize().  Most of the configuration is single-use, so we don't hold onto it.
   let panelData = {};

   /*
    * The UI is created dynamically from a supplied array of objects.  Each array element specifies the configuration
    * of an individual panel; you need to define at least one, and there is no upper limit.  The object has the
    * following members:
    *
    * title :  Text displayed at the top of the panel
    * url   :  The URL used to update the panel
    * fields:  An array of objects specifying field configuration:
    *             prop       : The property name present in the JSON response - also used in the HTML ID
    *             label      : Text displayed in front of the value
    *             suffix     : Text displayed after the value.  Optional.
    *             lowThresholds  : An optional object specifying warning and danger levels - used to drive visual feedback.
    *                              Supports only numeric values, so if your data is text you'll have to map it to a number.
    *                                 warn   : The warning threshold
    *                                 danger : The danger threshold
    *             highThresholds : Same as lowThresholds
    *             showMax    : A boolean which specifies whether to display the largest recorded value for 'prop'.
    *                          Assumes numeric values, so if your data is text you'll have to map it to a number.
    *                          When set to true, the max value will appear as a separate field immediately beneath the
    *                          field being tracked.
    */
   this.initialize = function( appCfg ) {
      for( let i = 0; i < appCfg.length; i++ ) {
         const panelCfg = appCfg[i];

         const panel = document.createElement( "div" );
         const titleBar = document.createElement( "div" );
         const btnMinMax = document.createElement( "button" );
         const fieldsContainer = document.createElement( "div" );
         const btnConnectContainer = document.createElement( "div" );
         const btnConnect = document.createElement( "button" );
         const graphContainer = document.createElement( "div" );
         const graphs = [];

         panel.id = ID_STUB_PANEL + i;
         panel.className = CLASS_MONITORING_PANEL;

         // The settings object gets built piecemeal - as the opportunity arises.
         settings[panel.id] = {};
         settings[panel.id].url = appCfg[i].url;
         settings[panel.id].highThresholds = {};

         titleBar.id = ID_STUB_TITLE + i;
         titleBar.className = CLASS_TITLEBAR;
         titleBar.appendChild( document.createTextNode(panelCfg.title) );

         btnMinMax.id = ID_STUB_MIN_MAX_BUTTON + i;
         btnMinMax.innerHTML = TEXT_BUTTON_MINIMIZE;
         btnMinMax.addEventListener( "click", function(event) { minimizeMaximize( this.id.replace(ID_STUB_MIN_MAX_BUTTON, "") ); } );
         titleBar.appendChild( btnMinMax );

         panel.appendChild( titleBar );

         panelData[ID_STUB_PANEL + i] = panelData[ID_STUB_PANEL + i] || [];

         fieldsContainer.className = CLASS_FIELDS_CONTAINER;

         for( let j = 0; j < panelCfg.fields.length; j++ ) {
            const fieldCfg = panelCfg.fields[j];

            if( fieldCfg.highThresholds ) {
               settings[panel.id].highThresholds[fieldCfg.prop] = fieldCfg.highThresholds;  // More opportunistic saving of settings
            }

            fieldsContainer.appendChild( newField(false, fieldCfg.prop, i, Boolean(fieldCfg.highThresholds), fieldCfg.label, fieldCfg.suffix) );

            if( fieldCfg.showMax ) {
               fieldsContainer.appendChild( newField(true, fieldCfg.prop, i, Boolean(fieldCfg.highThresholds), fieldCfg.label, fieldCfg.suffix) );
               panelData[ID_STUB_PANEL + i][PROP_STUB_HIGHEST + fieldCfg.prop] = null;
            }

            fieldsContainer.appendChild( newFieldSeparator() );
            panelData[ID_STUB_PANEL + i][fieldCfg.prop] = null;
            graphs.push( newGraph(fieldCfg.prop, i) );
         }

         graphContainer.className = CLASS_GRAPH_CONTAINER;

         panel.appendChild( fieldsContainer );
         panel.appendChild( graphContainer );

         btnConnectContainer.className = CLASS_CONNECT_BTN_CONTAINER;

         btnConnect.id = ID_STUB_CONNECT_BUTTON + i;
         btnConnect.addEventListener( "click", function(event) { connectBtnClick( this ); } );
         btnConnect.appendChild( document.createTextNode(TEXT_BUTTON_CONNECT) );
         btnConnectContainer.appendChild( btnConnect );

         panel.appendChild( btnConnectContainer );

         for( let j = 0; j < graphs.length; j++ ) {
            graphContainer.appendChild( graphs[j] );
         }

         document.body.appendChild( panel );

         function newField( isMax, propName, panelNum, hasThreshold, labelText, suffix ) {
            const fieldContainer = document.createElement( "div" );
            const status = document.createElement( "div" );
            const label = document.createElement( "label" );
            const val = document.createElement( "span" );

            fieldContainer.className = CLASS_FIELD_CONTAINER;

            if( isMax ) {
               propName = PROP_STUB_HIGHEST + propName;
               labelText = TEXT_LABEL_HIGHEST + " " + labelText;
            } else {
               fieldContainer.classList.add( CLASS_HAS_GRAPH );

               label.addEventListener( "click", function(event) {
                  showGraph( ID_STUB_GRAPH + this.getAttribute("for") );
               } );
            }

            status.id = ID_STUB_STATUS + propName + panelNum;  // Display color coding when there's an ID, otherwise keep the element for the sake of consistent indentation
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
            const elem = document.createElement( "span" );
            elem.id = ID_STUB_SUFFIX + prop + panelNum;
            elem.className = CLASS_VISIBILITY_HIDDEN;
            elem.appendChild( document.createTextNode(suffix) );
            return elem;
         }

         function newFieldSeparator() {
            const separator = document.createElement( "div" );
            separator.className = CLASS_FIELD_SEPARATOR;
            return separator;
         }

         function newGraph( propName, panelNum ) {
            const graph = document.createElement( "div" );

            graph.id = ID_STUB_GRAPH + propName + panelNum;
            graph.className = CLASS_VISIBILITY_GONE;
            graph.appendChild( document.createTextNode(graph.id) );

            return graph;
         }
      }
   };

   function minimizeMaximize( panelNum ) {
      const panel = document.getElementById( ID_STUB_PANEL + panelNum ),
            btn   = document.getElementById( ID_STUB_MIN_MAX_BUTTON + panelNum );

      if( panel.classList.contains(CLASS_MINIMIZED) ) {
         panel.classList.remove( CLASS_MINIMIZED );
         btn.innerHTML = TEXT_BUTTON_MINIMIZE;
      } else {
         panel.classList.add( CLASS_MINIMIZED );
         btn.innerHTML = TEXT_BUTTON_MAXIMIZE;
      }
   }

   function showGraph( id ) {
      const graph = document.getElementById( id );
      const graphContainer = graph.parentNode;

      for( let i = 0; i < graphContainer.childNodes.length; i++ ) {
         const classList = graphContainer.childNodes[i].classList;

         if( !classList.contains(CLASS_VISIBILITY_GONE) ) {
            classList.add( CLASS_VISIBILITY_GONE );
         }
      }

      graph.classList.remove( CLASS_VISIBILITY_GONE );
   }

   function connectBtnClick( btn ) {
      const panelNum = btn.id.replace( ID_STUB_CONNECT_BUTTON, "" );
      const connected = btn.innerHTML.indexOf( TEXT_BUTTON_DISCONNECT ) !== -1;

      if( connected ) {
         disconnect( panelNum );
         btn.innerHTML = TEXT_BUTTON_CONNECT;
      } else {
         connect( panelNum );
         btn.innerHTML = TEXT_BUTTON_DISCONNECT;
      }
   }

   let simulator = null;

   function connect( panelNum ) {
      simulator = window.setInterval( function() {
         const jsonResponse = JSON.stringify( {
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
      const panel = panelData[ ID_STUB_PANEL + panelNum ];
      const stats = JSON.parse( jsonResponse );

      for( let prop in stats ) {
         // Process recognized data; ignore unrecognized data
         if( panel[prop] !== undefined ) {
            const maxProp = PROP_STUB_HIGHEST + prop;
            panel[prop] = stats[prop];

            if( panel[maxProp] !== undefined ) {
               panel[maxProp] = panel[maxProp] >= panel[prop] ? panel[maxProp] : panel[prop];
            }
         }
      }
   }

   function updateUI( panelNum ) {
      const data = panelData[ ID_STUB_PANEL + panelNum ];
      const titleBar = document.getElementById( ID_STUB_TITLE + panelNum );

      let anyWarn = false,
          anyDanger = false;

      for( let prop in data ) {
         let thresholdProp = prop.replace( new RegExp("^" + PROP_STUB_HIGHEST), "" );
         let value = data[prop];
         let field = document.getElementById( prop + panelNum );

         if( field != null ) {
            const isMaxField = field.id.indexOf( PROP_STUB_HIGHEST ) === 0;
            const highThresholds = settings[ ID_STUB_PANEL + panelNum ].highThresholds[thresholdProp];
            const fieldStatus = document.getElementById( ID_STUB_STATUS + prop + panelNum );
            let className = CLASS_STATUS_NORMAL;

            field.innerHTML = "";
            field.appendChild( document.createTextNode(value) );

            if( highThresholds ) {
               if( highThresholds.danger && value >= highThresholds.danger ) {
                  className = CLASS_STATUS_DANGER;

                  if( !isMaxField ) {
                     anyDanger = true;
                  }
               } else if( highThresholds.warn && value >= highThresholds.warn ) {
                  className = CLASS_STATUS_WARN;

                  if( !isMaxField ) {
                     anyWarn = true;
                  }
               }
            }

            fieldStatus.classList.remove( CLASS_STATUS_NORMAL );
            fieldStatus.classList.remove( CLASS_STATUS_WARN );
            fieldStatus.classList.remove( CLASS_STATUS_DANGER );

            fieldStatus.classList.add( highThresholds ? className : CLASS_STATUS_NONE );

            const suffix = document.getElementById( ID_STUB_SUFFIX + prop + panelNum );

            if( suffix ) {
               suffix.classList.remove( CLASS_VISIBILITY_HIDDEN );
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
