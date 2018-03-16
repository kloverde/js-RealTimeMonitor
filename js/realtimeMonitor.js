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
 *     1. This software is not to be used by any for-profit entity, whether a
 *        business, person or other, or for any for-profit purpose.
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

function RealtimeMonitor() {
   const CLASS_MONITORING_PANEL      = "monitoringPanel",
         CLASS_TITLEBAR              = "titleBar",
         CLASS_TITLEBAR_TITLE        = "titleBarTitle",
         CLASS_TITLEBAR_CONTROLS     = "titleBarControls",
         CLASS_TITLEBAR_ONE_BUTTON   = "oneButton",
         CLASS_TITLEBAR_TWO_BUTTONS  = "twoButtons",
         CLASS_FIELD_CONTAINER       = "fieldContainer",
         CLASS_FIELDS_CONTAINER      = "fieldsContainer",
         CLASS_GRAPH_CONTAINER       = "graphContainer",
         CLASS_CONNECT_BTN_CONTAINER = "btnConnectContainer",
         CLASS_CURRENT_VALUE         = "currentValue",
         CLASS_HAS_GRAPH             = "hasGraph",
         CLASS_VISIBILITY_HIDDEN     = "visibilityHidden",
         CLASS_VISIBILITY_GONE       = "visibilityGone",
         CLASS_FIELD_SEPARATOR       = "fieldSeparator",
         CLASS_MINIMIZED             = "minimized",
         CLASS_STATUS                = "status",
         CLASS_STATUS_NORMAL         = "normal",
         CLASS_STATUS_WARN           = "warn",
         CLASS_STATUS_DANGER         = "danger",
         CLASS_STATUS_NONE           = "none",
         CLASS_HIGH_LOW_LABEL        = "highLowLabel",
         CLASS_HIGH_LOW_VALUE        = "highLowValue";

   const ID_STUB_PANEL               = "panel",
         ID_STUB_TITLE               = "title",
         ID_STUB_MIN_MAX_BUTTON      = "btnMinMax",
         ID_STUB_CLOSE_BUTTON        = "btnClose",
         ID_STUB_CONNECT_BUTTON      = "btnConnect",
         ID_STUB_GRAPH               = "graph",
         ID_STUB_STATUS              = "status",
         ID_STUB_SUFFIX              = "suffix";

   const TEXT_BUTTON_MINIMIZE        = "-",
         TEXT_BUTTON_MAXIMIZE        = "+",
         TEXT_BUTTON_CLOSE           = "x",
         TEXT_BUTTON_CONNECT         = "Connect",
         TEXT_BUTTON_DISCONNECT      = "Disconnect",
         TEXT_LABEL_HIGHEST          = "Highest",
         TEXT_LABEL_LOWEST           = "Lowest";

   const PROP_STUB_HIGHEST           = "highest",
         PROP_STUB_LOWEST            = "lowest";

   const FIELD_TYPE_FIELD            = 0,
         FIELD_TYPE_LOWEST           = 1,
         FIELD_TYPE_HIGHEST          = 2;

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
    *             showLowest/showHighest : A boolean which specifies whether to display the smallest/largest recorded value for 'prop'.
    *                                      Assumes numeric values, so if your data is text you'll have to map it to a number.  When
    *                                      set to true, the value will appear as a separate field immediately beneath the field being
    *                                      tracked.  When set to false, the low/high will viewable as a tooltip.
    */
   this.initialize = function( appCfg ) {
      for( let i = 0; i < appCfg.length; i++ ) {
         const panelCfg = appCfg[i];

         const panel = document.createElement( "div" );
         const titleBar = document.createElement( "div" ),
         const titleBarTitle = document.createElement( "div" );
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
         settings[panel.id].lowThresholds = {};
         settings[panel.id].highThresholds = {};
         settings[panel.id].autoConnect = something( panelCfg.autoConnect ) && panelCfg.autoConnect === true ? true : false;

         titleBar.id = panel.id + ID_STUB_TITLE;
         titleBar.className = CLASS_TITLEBAR;
         titleBarTitle.className = CLASS_TITLEBAR_TITLE;
         titleBarTitle.appendChild( document.createTextNode(panelCfg.title) );
         titleBar.appendChild( titleBarTitle );

         if( panelCfg.controls ) {
            const titleBarControls = document.createElement( "div" );
            let numButtons = 0;

            for( let i = 0; i < panelCfg.controls.length; i++ ) {
               let c = panelCfg.controls[i];

               if( c === "minimize" ) {
                  const btnMinMax = document.createElement( "button" );
                  btnMinMax.id = panel.id + ID_STUB_MIN_MAX_BUTTON;
                  btnMinMax.innerHTML = TEXT_BUTTON_MINIMIZE;

                  ( function(panelId) {
                     btnMinMax.addEventListener( "click", function(event) {
                        minimizeMaximize( panelId );
                     } );
                  } )( panel.id );

                  titleBarControls.appendChild( btnMinMax );
                  numButtons++;
               } else if( c === "close" ) {
                  const btnClose = document.createElement( "button" );
                  btnClose.id = panel.id + ID_STUB_CLOSE_BUTTON;
                  btnClose.innerHTML = TEXT_BUTTON_CLOSE;

                  ( function(panelId) {
                     btnClose.addEventListener( "click", function(event) {
                        close( panelId );
                     } );
                  } )( panel.id );

                  titleBarControls.appendChild( btnClose );
                  numButtons++;
               }
            }

            if( numButtons > 0 ) {
               titleBarControls.className = CLASS_TITLEBAR_CONTROLS;

               if( numButtons === 1 ) {
                  titleBarTitle.classList.add( CLASS_TITLEBAR_ONE_BUTTON );
               }

               if( numButtons === 2 ) {
                  titleBarTitle.classList.add( CLASS_TITLEBAR_TWO_BUTTONS );
                  titleBarControls.classList.add( CLASS_TITLEBAR_TWO_BUTTONS );
               }

               titleBar.appendChild( titleBarControls );
            }
         }

         panel.appendChild( titleBar );

         panelData[ID_STUB_PANEL + i] = panelData[ID_STUB_PANEL + i] || [];

         fieldsContainer.className = CLASS_FIELDS_CONTAINER;

         for( let j = 0; j < panelCfg.fields.length; j++ ) {
            const fieldCfg = panelCfg.fields[j];

            if( fieldCfg.lowThresholds ) {
               settings[panel.id].lowThresholds[fieldCfg.prop] = fieldCfg.lowThresholds;  // More opportunistic saving of settings
            }

            if( fieldCfg.highThresholds ) {
               settings[panel.id].highThresholds[fieldCfg.prop] = fieldCfg.highThresholds;  // More opportunistic saving of settings
            }

            fieldsContainer.appendChild( newField(FIELD_TYPE_FIELD, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );

            if( fieldCfg.showLowest ) {
               fieldsContainer.appendChild( newField(FIELD_TYPE_LOWEST, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );
            }

            if( fieldCfg.showHighest ) {
               fieldsContainer.appendChild( newField(FIELD_TYPE_HIGHEST, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );
            }

            panelData[ID_STUB_PANEL + i][fieldCfg.prop] = null;
            panelData[ID_STUB_PANEL + i][PROP_STUB_LOWEST + fieldCfg.prop] = null;
            panelData[ID_STUB_PANEL + i][PROP_STUB_HIGHEST + fieldCfg.prop] = null;

            fieldsContainer.appendChild( newFieldSeparator() );

            graphs.push( newGraph(panel.id, fieldCfg.prop) );
         }

         graphContainer.className = CLASS_GRAPH_CONTAINER;

         panel.appendChild( fieldsContainer );
         panel.appendChild( graphContainer );

         btnConnectContainer.className = CLASS_CONNECT_BTN_CONTAINER;
         btnConnect.id = panel.id + ID_STUB_CONNECT_BUTTON;

         ( function(panelId) {
            btnConnect.addEventListener( "click", function(event) {
               connectDisconnect( panelId );
            } );
         } )( panel.id );

         btnConnect.appendChild( document.createTextNode(TEXT_BUTTON_CONNECT) );
         btnConnectContainer.appendChild( btnConnect );

         panel.appendChild( btnConnectContainer );

         for( let j = 0; j < graphs.length; j++ ) {
            graphContainer.appendChild( graphs[j] );
         }

         if( panelCfg.startMinimized ) {
            panel.classList.add( CLASS_VISIBILITY_HIDDEN );
         }

         document.body.appendChild( panel );

         if( panelCfg.startMinimized ) {
            minimizeMaximize( panel.id );
            panel.classList.remove( CLASS_VISIBILITY_HIDDEN );
         }
      }

      function newField( fieldType, propName, panelId, labelText, suffix ) {
         const fieldContainer = document.createElement( "div" );
         const label = document.createElement( "label" );
         const val = document.createElement( "span" );

         let status = null;
         let highLowClass = null;

         fieldContainer.className = CLASS_FIELD_CONTAINER;

         if( fieldType === FIELD_TYPE_LOWEST ) {
            propName = PROP_STUB_LOWEST + propName;
            labelText = TEXT_LABEL_LOWEST + " " + labelText;
            highLowClass = CLASS_HIGH_LOW_VALUE;
         } else if( fieldType === FIELD_TYPE_HIGHEST ) {
            propName = PROP_STUB_HIGHEST + propName;
            labelText = TEXT_LABEL_HIGHEST + " " + labelText;
            highLowClass = CLASS_HIGH_LOW_VALUE;
         } else if( fieldType === FIELD_TYPE_FIELD ) {
            status = document.createElement( "div" );
            status.id = panelId + ID_STUB_STATUS + propName;  // Display color coding when there's an ID, otherwise keep the element for the sake of consistent indentation
            status.className = CLASS_STATUS;

            fieldContainer.classList.add( CLASS_CURRENT_VALUE );
            fieldContainer.classList.add( CLASS_HAS_GRAPH );
            fieldContainer.appendChild( status );

            label.addEventListener( "click", function(event) {
               showGraph( panelId + ID_STUB_GRAPH + propName );
            } );
         }

         val.id = panelId + propName;

         if( highLowClass ) {
            label.className = CLASS_HIGH_LOW_LABEL;
            val.className = highLowClass;
         }

         label.setAttribute( "for", val.id );
         label.appendChild( document.createTextNode(labelText) );
         fieldContainer.appendChild( label );

         fieldContainer.appendChild( val );

         if( suffix ) {
            fieldContainer.appendChild( newSuffix(highLowClass, suffix, propName, panelId) );
         }

         return fieldContainer;
      }

      for( let panelId in settings ) {
         if( settings[panelId].autoConnect ) {
            connectDisconnect( panelId );
         }
      }

      function newSuffix( highLowClass, suffix, prop, panelId ) {
         const elem = document.createElement( "span" );

         elem.id = panelId + ID_STUB_SUFFIX + prop;
         elem.className = CLASS_VISIBILITY_HIDDEN;

         if( highLowClass ) {
            elem.classList.add( highLowClass );
         }

         elem.appendChild( document.createTextNode(suffix) );

         return elem;
      }

      function newFieldSeparator() {
         const separator = document.createElement( "div" );
         separator.className = CLASS_FIELD_SEPARATOR;
         return separator;
      }

      function newGraph( panelId, propName ) {
         const graph = document.createElement( "div" );

         graph.id = panelId + ID_STUB_GRAPH + propName;
         graph.className = CLASS_VISIBILITY_GONE;
         graph.appendChild( document.createTextNode(graph.id) );

         return graph;
      }
   };

   function minimizeMaximize( panelId ) {
      const panel = document.getElementById( panelId ),
            btn   = document.getElementById( panelId + ID_STUB_MIN_MAX_BUTTON );

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

   function connectDisconnect( panelId ) {
      const btn = document.getElementById( panelId + ID_STUB_CONNECT_BUTTON );
      const connected = btn.innerHTML.indexOf( TEXT_BUTTON_DISCONNECT ) !== -1;

      if( connected ) {
         disconnect( panelId );
         btn.innerHTML = TEXT_BUTTON_CONNECT;
      } else {
         connect( panelId );
         btn.innerHTML = TEXT_BUTTON_DISCONNECT;
      }
   }

   let simulator = null;

   function connect( panelId ) {
      simulator = window.setInterval( function() {
         const jsonResponse = JSON.stringify( {
            load         : random( 50, 100 ),
            rpm          : random( 200, 2700 ),
            ambientTemp  : random( 70, 75 ),
            internalTemp : random( 175, 260 ),
            rhinocerous  : 45,  // unrecognized properties do not cause errors
            jsonXss      : "<img src=\"asdf\" onerror=\"alert('json xss')\" />", // see the XSS test in demo.html (second panel)
         } );

         updateStats( panelId, jsonResponse );
         updateUI( panelId );
      }, 2000 );

      function random( from, to ) {
         return Math.floor( Math.random() * (to - from + 1) ) + from;
      }
   }

   function disconnect( panelId ) {
      window.clearInterval( simulator );
   }

   function close( panelId ) {
      disconnect( panelId );

      const panel = document.getElementById( panelId );

      if( panel ) {
         panel.parentNode.removeChild( panel );
      }

      panelData[ panelId ] = undefined;
      settings[ panelId ] = undefined;
   }

   function updateStats( panelId, jsonResponse ) {
      const panel = panelData[ panelId ];
      const stats = JSON.parse( jsonResponse );

      for( let prop in stats ) {
         // Process recognized data; ignore unrecognized data
         if( defined(panel[prop])  ) {
            const lowestProp  = PROP_STUB_LOWEST + prop,
                  highestProp = PROP_STUB_HIGHEST + prop;

            panel[prop] = stats[prop];
            panel[lowestProp] = panel[lowestProp] == null || panel[lowestProp] > panel[prop] ? panel[prop] : panel[lowestProp];
            panel[highestProp] = panel[highestProp] == null || panel[highestProp] < panel[prop] ? panel[prop] : panel[highestProp];
         }
      }
   }

   function updateUI( panelId ) {
      const data = panelData[ panelId ];
      const titleBar = document.getElementById( panelId + ID_STUB_TITLE );

      let anyWarn   = false,
          anyDanger = false,
          showStatusInTitleBar = false;

      for( let prop in data ) {
         const thresholdProp = prop.replace( new RegExp("^(" + PROP_STUB_LOWEST + "|" + PROP_STUB_HIGHEST + ")"), "" );

         const lowThresholds  = settings[ panelId ].lowThresholds[ thresholdProp ],
               highThresholds = settings[ panelId ].highThresholds[ thresholdProp ];

         const value = data[ prop ];

         const field = document.getElementById( panelId + prop );

         showStatusInTitleBar = !showStatusInTitleBar && (something(lowThresholds) || something(highThresholds));

         if( field ) {
            const isLowField  = prop.indexOf( PROP_STUB_LOWEST ) === 0,
                  isHighField = !isLowField && prop.indexOf( PROP_STUB_HIGHEST ) === 0;

            const fieldStatus = document.getElementById( panelId + ID_STUB_STATUS + prop );

            let classNameFromLowThreshold  = null,
                classNameFromHighThreshold = null,
                winningClassName = lowThresholds || highThresholds ? CLASS_STATUS_NORMAL : CLASS_STATUS_NONE;

            field.innerHTML = "";
            field.appendChild( document.createTextNode(value) );

            if( lowThresholds ) {
               classNameFromLowThreshold = checkAgainstLow();

               if( classNameFromLowThreshold === CLASS_STATUS_WARN ) {
                  if( !isLowField && !isHighField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyWarn = true;
                  }
               } else if( classNameFromLowThreshold === CLASS_STATUS_DANGER ) {
                  if( !isLowField && !isHighField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyDanger = true;
                  }
               }
            }

            if( highThresholds ) {
               classNameFromHighThreshold = checkAgainstHigh();

               if( classNameFromHighThreshold === CLASS_STATUS_WARN ) {
                  if( !isLowField && !isHighField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyWarn = true;
                  }
               } else if( classNameFromHighThreshold === CLASS_STATUS_DANGER ) {
                  if( !isLowField && !isHighField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyDanger = true;
                  }
               }
            }

            // Pick the worst outcome as the winning field status

            if( classNameFromLowThreshold === CLASS_STATUS_WARN || classNameFromHighThreshold === CLASS_STATUS_WARN ) {
               winningClassName = CLASS_STATUS_WARN;
            }

            if( classNameFromLowThreshold === CLASS_STATUS_DANGER || classNameFromHighThreshold === CLASS_STATUS_DANGER ) {
               winningClassName = CLASS_STATUS_DANGER;
            }

            if( fieldStatus ) {
               setStatusColor( fieldStatus, winningClassName );
            }

            const suffix = document.getElementById( panelId + ID_STUB_SUFFIX + prop );

            if( suffix ) {
               suffix.classList.remove( CLASS_VISIBILITY_HIDDEN );
            }

            if( isLowField || isHighField ) {
               setStatusColor( field, winningClassName );

               if( suffix ) {
                  setStatusColor( suffix, winningClassName );
               }
            }

            function setStatusColor( element, className ) {
               element.classList.remove( CLASS_STATUS_NORMAL );
               element.classList.remove( CLASS_STATUS_WARN );
               element.classList.remove( CLASS_STATUS_DANGER );
               element.classList.add( className );
            }

            function checkAgainstLow() {
               var className = CLASS_STATUS_NORMAL;

               if( something(lowThresholds) && something(lowThresholds.danger) && value <= lowThresholds.danger ) {
                  className = CLASS_STATUS_DANGER;
               } else if( something(lowThresholds) && something(lowThresholds.warn) && value <= lowThresholds.warn ) {
                  className = CLASS_STATUS_WARN;
               }

               return className;
            }

            function checkAgainstHigh() {
               var className = CLASS_STATUS_NORMAL;

               if( something(highThresholds.danger) && value >= highThresholds.danger ) {
                  className = CLASS_STATUS_DANGER;
               } else if( something(highThresholds.warn) && value >= highThresholds.warn ) {
                  className = CLASS_STATUS_WARN;
               }

               return className;
            }
         }
      }

      titleBar.classList.remove( CLASS_STATUS_NORMAL );
      titleBar.classList.remove( CLASS_STATUS_WARN );
      titleBar.classList.remove( CLASS_STATUS_DANGER );

      // Pick the worst outcome as the winning title bar status

      if( showStatusInTitleBar ) {
         if( anyDanger ) {
            titleBar.classList.add( CLASS_STATUS_DANGER );
         } else if( anyWarn ) {
            titleBar.classList.add( CLASS_STATUS_WARN );
         } else {
            titleBar.classList.add( CLASS_STATUS_NORMAL );
         }
      } else {
         titleBar.classList.add( CLASS_STATUS_NONE );
      }
   }

   function defined( obj ) {
      return typeof obj !== "undefined";
   }

   function something( obj ) {
      const isUndef = typeof obj === "undefined";
      let isNull = false;

      if( !isUndef ) {
         isNull = obj == null;
      }

      return !isUndef && !isNull;
   }
}
