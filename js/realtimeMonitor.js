/*
 * RealtimeMonitor
 * https://www.github.com/kloverde/js-RealtimeMonitor
 *
 * Copyright (c) 2018, Kurtis LoVerde
 * All rights reserved.
 *
 * Donations:  https://paypal.me/KurtisLoVerde/10
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

function RealtimeMonitor() {
   const CLASS_MONITORING_PANEL      = "monitoringPanel",
         CLASS_PANEL_BODY            = "panelBody",
         CLASS_TITLEBAR              = "titleBar",
         CLASS_TITLEBAR_TITLE        = "titleBarTitle",
         CLASS_TITLEBAR_CONTROLS     = "titleBarControls",
         CLASS_APP_MENU              = "applicationMenu",
         CLASS_APP_MENU_ACTIVE       = "menuActive",
         CLASS_APP_MENU_BUTTON       = "appMenuButton",
         CLASS_APP_MENU_ITEM         = "applicationMenuItem",
         CLASS_FIELD_CONTAINER       = "fieldContainer",
         CLASS_FIELDS_CONTAINER      = "fieldsContainer",
         CLASS_GRAPH_CONTAINER       = "graphContainer",
         CLASS_GRAPH_COLOR           = "graphColor",
         CLASS_GRAPH_FILL_COLOR      = "graphFillColor",
         CLASS_GRAPH_EDGE_COLOR      = "graphEdgeColor",
         CLASS_GRAPH_LABEL_COLOR     = "graphLabelColor",
         CLASS_GRAPH_GRID_COLOR      = "graphGridColor",
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

   const ID_STUB_PANEL               = "realtimeMonitorPanel",
         ID_STUB_PANEL_BODY          = "panelBody",
         ID_STUB_TITLE               = "title",
         ID_STUB_TITLEBAR_CONTROLS   = "titleBarControls",
         ID_STUB_APP_MENU            = "appMenu",
         ID_STUB_APP_MENU_BUTTON     = "appMenuBtn",
         ID_STUB_MENUITEM_CONNECT    = "menuItemConnect",
         ID_STUB_MENUITEM_MIN_MAX    = "menuItemMinMax",
         ID_STUB_MENUITEM_MUTE       = "menuItemNotif",
         ID_STUB_MENUITEM_CLOSE      = "menuItemClose",
         ID_STUB_LABEL               = "label",
         ID_STUB_GRAPH               = "graph",
         ID_STUB_GRAPH_FILL_COLOR    = CLASS_GRAPH_FILL_COLOR,
         ID_STUB_GRAPH_EDGE_COLOR    = CLASS_GRAPH_EDGE_COLOR,
         ID_STUB_GRAPH_LABEL_COLOR   = CLASS_GRAPH_LABEL_COLOR,
         ID_STUB_GRAPH_GRID_COLOR    = CLASS_GRAPH_GRID_COLOR,
         ID_STUB_STATUS              = "status",
         ID_STUB_SUFFIX              = "suffix";

   const TEXT_MENUITEM_MINIMIZE      = "Minimize",
         TEXT_MENUITEM_MAXIMIZE      = "Maximize",
         TEXT_MENUITEM_MUTE          = "Mute Notifications",
         TEXT_MENUITEM_UNMUTE        = "Unmute Notifications",
         TEXT_MENUITEM_CLOSE         = "Close Panel",
         TEXT_MENUITEM_CONNECT       = "Connect",
         TEXT_MENUITEM_DISCONNECT    = "Disconnect",
         TEXT_LABEL_LOWEST           = "Lowest",
         TEXT_LABEL_HIGHEST          = "Highest",
         TEXT_TOOLTIP_LOWEST         = "lowest: ",
         TEXT_TOOLTIP_HIGHEST        = "highest: ";

   const PROP_STUB_HIGHEST           = "highest",
         PROP_STUB_LOWEST            = "lowest";

   const FIELD_TYPE_FIELD            = 0,
         FIELD_TYPE_LOWEST           = 1,
         FIELD_TYPE_HIGHEST          = 2;

   const THRESHOLD_NOTIFICATION_TYPE_WARN    = 0,
         THRESHOLD_NOTIFICATION_TYPE_DANGER  = 1,
         THRESHOLD_NOTIFICATION_TAG          = "threshold",
         THRESHOLD_NOTIFICATION_TITLE_WARN   = "Warning:  ",
         THRESHOLD_NOTIFICATION_TITLE_DANGER = "Danger:  ",
         THRESHOLD_NOTIFICATION_BODY_WARN    = " reached a warning threshold on ",
         THRESHOLD_NOTIFICATION_BODY_DANGER  = " reached a danger threshold on ";

   const INTERVAL_GRAPH_THEME_REFRESH = "graphThemeRefresh";

   const CACHE = [],
         THRESHOLD_NOTIFICATION_ICON_WARN    = "THRESHOLD_NOTIFICATION_ICON_WARN",
         THRESHOLD_NOTIFICATION_ICON_DANGER  = "THRESHOLD_NOTIFICATION_ICON_DANGER";

   const SETTING_MINIMUM_INTERVAL_SECONDS = 3;

   const settings = {};  // This is a subset of the configuration passed into newPanel().  Most of the configuration is single-use, so we don't hold onto it.
   const panelData = {};
   const intervals = [];
   const graphs = [];

   let panelCnt = 0;

   let notificationsSupported = true,
       notificationsOk        = false,
       thresholdNotifications = [];

   cacheImages( CACHE, [ [THRESHOLD_NOTIFICATION_ICON_WARN,   "img/notification-warn.png"],
                         [THRESHOLD_NOTIFICATION_ICON_DANGER, "img/notification-danger.png"] ] );
 
   areNotificationsOk();

   function cacheImages( cache, images ) {
      for( let i = 0; i < images.length; i++ ) {
         const img = new Image();
         img.src = images[i][1];
         img.onload = function() {
            cache[ images[i][0] ] = convertImgToDataUri( img );
         };
      }
   }

   function convertImgToDataUri( img ) {
      const canvas = document.createElement( "canvas"),
            context = canvas.getContext( "2d" );

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage( img, 0, 0, img.width, img.height );

      return canvas.toDataURL( "image/" + img.src.replace(/^.*\./, "") );
   }

   // Modifies a global variable because Notification.requestPermission() uses promises.
   // Called repeatedly - not just at initialization - because the user can change their browser settings at any time.
   function areNotificationsOk() {
      if( !("Notification" in window)) {
         notificationsSupported = false;
         notificationsOk = false;
         return;
      }

      if( Notification.permission === "denied" || Notification.permission === "blocked" ) {
         notificationsOk = false;
         return;
      }

      if( Notification.permission === "granted" ) {
         notificationsOk = true;
         return;
      }

      if( Notification.permission === "default" ) {
         Notification.requestPermission( function(permission) {
            if( permission === "granted" ) {
               notificationsOk = true;
            }
         } );
      }
   }

    // Based on a supplied configuration object, creates a panel and returns it as a DOM object.  See README.MD and the included demo for the object definition.
   this.newPanel = function( panelCfg ) {
      const panel = document.createElement( "div" );
      panel.id = ID_STUB_PANEL + panelCnt;
      panel.className = CLASS_MONITORING_PANEL;

      panelData[ID_STUB_PANEL + panelCnt] = panelData[ID_STUB_PANEL + panelCnt] || [];

      settings[panel.id] = validateSettings( panel.id, panelCfg );

      const titleBar = document.createElement( "div" );
      titleBar.id = panel.id + ID_STUB_TITLE;
      titleBar.className = CLASS_TITLEBAR;
      titleBar.addEventListener( "dblclick", function(event) {minimizeMaximize(panel.id);} );
      const titleBarTitle = document.createElement( "div" );
      titleBarTitle.className = CLASS_TITLEBAR_TITLE;
      titleBarTitle.appendChild( document.createTextNode(panelCfg.title) );

      titleBar.appendChild( titleBarTitle );

      const menuBtn = document.createElement( "div" );
      menuBtn.id = panel.id + ID_STUB_APP_MENU_BUTTON;
      menuBtn.className = CLASS_APP_MENU_BUTTON;

      menuBtn.addEventListener( "click", function(event) {
         toggleApplicationMenu( panel.id );
      } );

      // Register a double click event for the sole purpose of stopping event bubbling to the title bar (prevents minimizing when double clicking the menu button)
      menuBtn.addEventListener( "dblclick", function(event) { event.stopPropagation(); } );

      // Close the menu when clicking away
      panel.addEventListener( "click", function(event) { menuCloseClickEvent( event ); } );
      document.addEventListener( "click", function(event) { menuCloseClickEvent( event ); } );

      function menuCloseClickEvent( event ) {
         if( event.originalTarget !== menuBtn && event.srcElement !== menuBtn ) {
            closeApplicationMenu( panel.id );
         }
      }

      const titleBarControls = document.createElement( "div" );
      titleBarControls.id = panel.id + ID_STUB_TITLEBAR_CONTROLS;
      titleBarControls.appendChild( menuBtn );
      titleBarControls.classList.add( CLASS_TITLEBAR_CONTROLS )

      titleBar.appendChild( titleBarControls );
      panel.appendChild( titleBar );

      const appMenu = document.createElement( "div" );
      appMenu.id = panel.id + ID_STUB_APP_MENU;
      appMenu.className = CLASS_APP_MENU;
      appMenu.classList.add( CLASS_VISIBILITY_HIDDEN );
      appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_CONNECT, TEXT_MENUITEM_CONNECT,  function(){ connectDisconnect(panel.id); }) );
      appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_MIN_MAX, TEXT_MENUITEM_MINIMIZE, function(){ minimizeMaximize(panel.id); }) );
      appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_MUTE,    TEXT_MENUITEM_MUTE,     function(){ toggleNotifications(panel.id); }) );
      appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_CLOSE,   TEXT_MENUITEM_CLOSE,    function(){ close(panel.id); }) );

      titleBar.appendChild( appMenu );

      const panelBody = document.createElement( "div" );
      panelBody.id = panel.id + ID_STUB_PANEL_BODY;
      panelBody.className = CLASS_PANEL_BODY;

      const fieldsContainer = document.createElement( "div" );
      fieldsContainer.className = CLASS_FIELDS_CONTAINER;

      for( let j = 0; j < panelCfg.fields.length; j++ ) {
         const fieldCfg = panelCfg.fields[j];

         fieldsContainer.appendChild( newField(FIELD_TYPE_FIELD, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );

         if( settings[panel.id].fields[fieldCfg.prop].showLowest ) {
            fieldsContainer.appendChild( newField(FIELD_TYPE_LOWEST, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );
         }

         if( settings[panel.id].fields[fieldCfg.prop].showHighest ) {
            fieldsContainer.appendChild( newField(FIELD_TYPE_HIGHEST, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );
         }

         panelData[ID_STUB_PANEL + panelCnt][fieldCfg.prop] = null;
         panelData[ID_STUB_PANEL + panelCnt][PROP_STUB_LOWEST + fieldCfg.prop] = null;
         panelData[ID_STUB_PANEL + panelCnt][PROP_STUB_HIGHEST + fieldCfg.prop] = null;

         fieldsContainer.appendChild( newFieldSeparator() );

         const graph = newGraph( panel.id, fieldCfg.prop, fieldCfg.label + (something(fieldCfg.suffix) ? " (" + fieldCfg.suffix + ")" : "" ) );
         graphs[panel.id] = graphs[panel.id] || [];
         graphs[panel.id][graph.canvas.id] = graph;
      }

      panelBody.appendChild( fieldsContainer );

      const graphContainer = document.createElement( "div" );
      graphContainer.className = CLASS_GRAPH_CONTAINER;

      panelBody.appendChild( graphContainer );

      let firstGraph = true;
      for( let graphId in graphs[panel.id] ) {
         const graph = graphs[panel.id][graphId].canvas;

         if( firstGraph ) {
            graph.classList.remove( CLASS_VISIBILITY_GONE );
         }

         graphContainer.appendChild( graph );
         firstGraph = false;
      }

      // See refreshGraphTheme() for an explanation of what this is setting up
      graphContainer.appendChild( newGraphColor(panel.id, CLASS_GRAPH_FILL_COLOR) );
      graphContainer.appendChild( newGraphColor(panel.id, CLASS_GRAPH_EDGE_COLOR) );
      graphContainer.appendChild( newGraphColor(panel.id, CLASS_GRAPH_LABEL_COLOR) );
      graphContainer.appendChild( newGraphColor(panel.id, CLASS_GRAPH_GRID_COLOR) );

      panel.appendChild( panelBody );

      // React to default settings.  Need to wrap these in a MutationObserver because
      // the panel hasn't been added to the DOM, and document.getElementById is used.

      let observer = new MutationObserver( function(mutations) {
         mutations.forEach( function(mutationRecord) {
            for( let i = 0; i < mutationRecord.addedNodes.length; i++ ) {
               if( mutationRecord.addedNodes[i].id === panel.id ) {
                  if( panelCfg.startMinimized ) {
                     minimizeMaximize( panel.id );
                  }

                  setNotificationsEnabled( panel.id, settings[panel.id].notifications );

                  if( settings[panel.id].autoConnect ) {
                     connectDisconnect( panel.id );
                  }
               
                  observer.disconnect();
                  observer = undefined;
               }
            }            
         } );
      } );

      observer.observe( document.body, { childList : true } );

      panelCnt++;

      return panel;
   };

   function newGraphColor( panelId, id ) {
      const graphColor = document.createElement( "span" );
      graphColor.id = panelId + id;
      graphColor.className = CLASS_GRAPH_COLOR;
      graphColor.classList.add( id );
      return graphColor;
   }

   function newAppMenuItem( panelId, menuItemIdStub, text, clickCallback ) {
      const item = document.createElement( "div" );

      item.id = panelId + menuItemIdStub;
      item.className = CLASS_APP_MENU_ITEM;
      item.appendChild( document.createTextNode(text) );
      item.addEventListener( "click", function() {
         clickCallback();
         closeApplicationMenu( panelId );
      } );

      return item;
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

      label.id = ID_STUB_LABEL + val.id;
      label.setAttribute( "for", val.id );
      label.appendChild( document.createTextNode(labelText + ":") );
      fieldContainer.appendChild( label );

      fieldContainer.appendChild( val );

      if( suffix ) {
         fieldContainer.appendChild( newSuffix(highLowClass, suffix, propName, panelId) );
      }

      return fieldContainer;
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

   function newGraph( panelId, propName, title ) {
      const canvas = document.createElement( "canvas" );
      const ctx = canvas.getContext( "2d" );

      canvas.id = panelId + ID_STUB_GRAPH + propName;
      canvas.className = CLASS_VISIBILITY_GONE;

      const graph = new Chart( ctx, {
         type : "line",
         data : {
            datasets: [ {
               label : "",
               data  : [],
               backgroundColor : getGraphFillColor( panelId ),
               borderColor : getGraphEdgeColor( panelId ),
               borderWidth : 1
           } ]
         },
         options : {
            legend   : { display : false },
            title    : { display : true, text : title, position : "top", fontColor : getGraphLabelColor(panelId) },
            tooltips : { mode    : "point", displayColors : false },

            // performance tuning
            elements  : { line: {tension : 0} },   // disables bezier curves
            animation : { duration : 0 },          // general animation time - incurs a severe performance penalty, even on a Core i7
            hover     : { animationDuration : 0 }  // duration of animations when hovering over an item
         }
      } );

      return { canvas : canvas, graph : graph };
   }

   function getGraphGridColor( panelId ) {
      const span = document.getElementById( panelId + ID_STUB_GRAPH_GRID_COLOR );
      return span ? window.getComputedStyle( span ).getPropertyValue( "background-color" ) : [];
   }

   function getGraphLabelColor( panelId ) {
      const span = document.getElementById( panelId + ID_STUB_GRAPH_LABEL_COLOR );
      return span ? window.getComputedStyle( span ).getPropertyValue( "background-color" ) : [];
   }

   function getGraphFillColor( panelId ) {
      const span = document.getElementById( panelId + ID_STUB_GRAPH_FILL_COLOR );
      return span ? window.getComputedStyle( span ).getPropertyValue( "background-color" ) : [];
   }

   function getGraphEdgeColor( panelId ) {
      const span = document.getElementById( panelId + ID_STUB_GRAPH_EDGE_COLOR );
      return span ? window.getComputedStyle( span ).getPropertyValue( "background-color" ) : [];
   }

   function toggleNotifications( panelId ) {
      if( notificationsSupported ) {
         const menuVal = document.getElementById( panelId + ID_STUB_MENUITEM_MUTE ).innerText;
         setNotificationsEnabled( panelId, !(menuVal === TEXT_MENUITEM_MUTE) );
      } else {
         alert( "Notifications are not supported by your browser.  To make use of notification functionality, you'll need to install a supporting browser, such as a recent version of Firefox or Chrome." );
      }
   };

   function setNotificationsEnabled( panelId, enabled ) {
      const menuItem = document.getElementById( panelId + ID_STUB_MENUITEM_MUTE );
      menuItem.innerText = enabled ? TEXT_MENUITEM_MUTE : TEXT_MENUITEM_UNMUTE;
      settings[panelId].notifications = enabled;
   }

   function toggleApplicationMenu( panelId ) {
      const titleBarControls = document.getElementById( panelId + ID_STUB_TITLEBAR_CONTROLS );
      const menu = document.getElementById( panelId + ID_STUB_APP_MENU );

      if( menu && titleBarControls ) {
         if( menu.classList.contains(CLASS_VISIBILITY_HIDDEN) ) {
            menu.classList.remove( CLASS_VISIBILITY_HIDDEN );
            titleBarControls.classList.add( CLASS_APP_MENU_ACTIVE );
         } else {
            menu.classList.add( CLASS_VISIBILITY_HIDDEN );
            titleBarControls.classList.remove( CLASS_APP_MENU_ACTIVE );
         }
      }
   }

   function closeApplicationMenu( panelId ) {
      const titleBarControls = document.getElementById( panelId + ID_STUB_TITLEBAR_CONTROLS );
      const menu = document.getElementById( panelId + ID_STUB_APP_MENU );

      if( menu ) {
         menu.classList.add( CLASS_VISIBILITY_HIDDEN );
         titleBarControls.classList.remove( CLASS_APP_MENU_ACTIVE );
      }
   }

   function minimizeMaximize( panelId ) {
      const panelBody = document.getElementById( panelId + ID_STUB_PANEL_BODY ),
            menuItem = document.getElementById( panelId + ID_STUB_MENUITEM_MIN_MAX );

      if( panelBody.classList.contains(CLASS_MINIMIZED) ) {  // we're maximizing
         panelBody.classList.remove( CLASS_MINIMIZED );
         menuItem.innerHTML = TEXT_MENUITEM_MINIMIZE;
      } else {  // we're minimizing
         panelBody.classList.add( CLASS_MINIMIZED );
         menuItem.innerHTML = TEXT_MENUITEM_MAXIMIZE;
         closeApplicationMenu( panelId );
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
      const menuItem = document.getElementById( panelId + ID_STUB_MENUITEM_CONNECT );
      const connected = menuItem.innerHTML.indexOf( TEXT_MENUITEM_DISCONNECT ) !== -1;

      if( connected ) {
         disconnect( panelId );
         menuItem.innerHTML = TEXT_MENUITEM_CONNECT;
      } else {
         connect( panelId );
         menuItem.innerHTML = TEXT_MENUITEM_DISCONNECT;
      }
   }

   function connect( panelId ) {
      const cfg = settings[panelId].url;

      if( !intervals[panelId] ) {
         if( !intervals[INTERVAL_GRAPH_THEME_REFRESH] ) {
            intervals[INTERVAL_GRAPH_THEME_REFRESH] = window.setInterval( function() {
               for( let panId in graphs ) {
                  const panelsGraphs = graphs[panId];

                  for( let graphId in panelsGraphs ) {
                     const canvas = panelsGraphs[graphId].canvas;

                     if( isVisible(canvas) ) {
                        refreshGraphTheme( panId, graphId );
                        break;
                     }
                  }
               }
            }, 1000 );
         }

         intervals[panelId] = window.setInterval( function() {
            if( cfg.method === "GET" ) {
               ajaxGet( cfg.address, onSuccess );
            } else if( cfg.method === "POST" ) {
               ajaxPost( cfg.address, cfg.postData, onSuccess );
            } else {
               throw new Error( "Invalid method: " + request.method );
            }
         }, cfg.interval * 1000 );
      }

      function onSuccess( responseText ) {
         // IE 11 is the minimal IE version supported; it doesn't support xhr.requestType = "json", so we're stuck using responseText and doing manual JSON parsing.
         const response = JSON.parse( responseText );
         updateStats( panelId, response );
         updateUI( panelId );
      }
   }

   function ajaxGet( url, onSuccessCallback ) {
      const xhr = ajaxHelper( "GET", url, onSuccessCallback );
      xhr.send();
   }

   function ajaxPost( url, data, onSuccessCallback ) {
      const xhr = ajaxHelper( "POST", url, onSuccessCallback );
      xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );

      var params = Object.keys( data ).map( function(key) {
         return encodeURIComponent( key ) + '=' + encodeURIComponent( data[key] )
      } ).join( "&" );

      xhr.send( params );
   }

   function ajaxHelper( method, url, onSuccessCallback ) {
      const xhr = new XMLHttpRequest();

      xhr.open( method, url );
      xhr.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );

      xhr.onreadystatechange = function() {
         if( xhr.readyState === 4 && xhr.status === 200 ) {
            if( typeof onSuccessCallback === "function" ) {
               onSuccessCallback( xhr.responseText );
            }
         }
      };

      return xhr;
   }

   function disconnect( panelId ) {
      window.clearInterval( intervals[panelId] );
      intervals[panelId] = null;

      if( thresholdNotifications ) {
         const notif = thresholdNotifications[panelId];

         if( notif ) {
            notif.close();
            thresholdNotifications[panelId] = undefined;
         }
      }
   }

   function close( panelId ) {
      disconnect( panelId );

      const panel = document.getElementById( panelId );

      if( panel ) {
         panel.parentNode.removeChild( panel );
      }

      panelData[panelId] = undefined;
      settings[panelId] = undefined;
   }

   function updateStats( panelId, response ) {
      const panel = panelData[ panelId ];

      for( let prop in response ) {
         // Process recognized data; ignore unrecognized data
         if( defined(panel[prop])  ) {
            const lowestProp  = PROP_STUB_LOWEST + prop,
                  highestProp = PROP_STUB_HIGHEST + prop;

            panel[prop] = response[prop];
            panel[lowestProp] = panel[lowestProp] == null || panel[lowestProp] > panel[prop] ? panel[prop] : panel[lowestProp];
            panel[highestProp] = panel[highestProp] == null || panel[highestProp] < panel[prop] ? panel[prop] : panel[highestProp];
         }
      }
   }

   /**
    * So here's an unfortunate situation.
    *
    * 1.  There's no single color combination for a graph that works with every theme.
    * 2.  Chart.js doesn't support styling via CSS - it applies styling properties directly via JavaScript.
    * 3.  The user can change the theme at any time, and no event is fired by the browser when it happens.
    * 
    * This means that when the theme is changed to one that doesn't work with the graph's current colors, there's no way to tell Chart.js to apply the new
    * colors because we aren't informed that the user did anything.
    *
    * A kludge is used to address this as best as possible.  The theme stylesheets contain styles for hidden <span>s - one <span> per component of the graph
    * which needs to have configurable color.  The stylesheet sets the background-color on these hidden <span>s, and then they're extracted and applied to
    * the graphs via JavaScript.  That's where we encounter a second problem, requiring a second kludge:
    *
    * The graph needs to redraw to be displayed in the new colors.  Waiting for the next URL polling isn't an option because the interval is *at least* 3 seconds
    * (the shortest allowed polling interval).  There needs to be the appearance of responsiveness to the user changing the theme.  Therefore, the reapplication
    * of color and redrawing needs to happen independently, on its own schedule; this is done once per second.  For the sake of efficiency, only the currently-
    * displayed graph of each panel is accessed.  The hidden ones get updated soon enough, during the regular URL polling, and so aren't a concern.
    *
    * As icky as all this sounds (and is), there's no noticeable performance impact - neither in user perception nor observed CPU use.
    */
   function refreshGraphTheme( panelId, graphId ) {
      const graph = graphs[panelId][graphId].graph,
      dataset = graph.data.datasets[0],
      data = dataset.data,
      labels = graph.data.labels,
      labelColor = getGraphLabelColor( panelId ),
      gridColor = getGraphGridColor( panelId );

      // Change the color of the y-axis label.  Changing the color through the fine-grained
      // setting works only once:  graph.options.scales.yAxes[0].ticks.fontColor = labelColor;
      // However, Chart.js always checks the value of the GLOBAL font configuration.  Sounds
      // like a bug.  [Chart.js v2.7.2]
      Chart.defaults.global.defaultFontColor = labelColor;

      graph.options.title.fontColor = labelColor;
      graph.options.scales.xAxes[0].gridLines.color = gridColor;
      graph.options.scales.yAxes[0].gridLines.color = gridColor;
      dataset.backgroundColor = getGraphFillColor( panelId );
      dataset.borderColor = getGraphEdgeColor( panelId );

      graph.update();
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
            const label = document.getElementById( ID_STUB_LABEL + panelId + prop );

            const isLowField  = prop.indexOf( PROP_STUB_LOWEST ) === 0,
                  isHighField = !isLowField && prop.indexOf( PROP_STUB_HIGHEST ) === 0,
                  isCurrentReadingField = !isHighField && !isLowField;

            const fieldStatus = document.getElementById( panelId + ID_STUB_STATUS + prop );

            let classNameFromLowThreshold  = null,
                classNameFromHighThreshold = null,
                winningClassName = lowThresholds || highThresholds ? CLASS_STATUS_NORMAL : CLASS_STATUS_NONE;

            label.title = "";
            field.innerHTML = "";
            field.appendChild( document.createTextNode(value) );

            if( isCurrentReadingField ) {
               if( !settings[panelId].fields[prop].showLowest ) {
                  label.title += TEXT_TOOLTIP_LOWEST + panelData[panelId][PROP_STUB_LOWEST + prop];
               }

               if( !settings[panelId].fields[prop].showHighest ) {
                  label.title += (!settings[panelId].fields[prop].showLowest ? ", " : "") + TEXT_TOOLTIP_HIGHEST + panelData[panelId][PROP_STUB_HIGHEST + prop];
               }
            }

            if( lowThresholds ) {
               classNameFromLowThreshold = checkAgainstLow();

               if( classNameFromLowThreshold === CLASS_STATUS_WARN ) {
                  if( isCurrentReadingField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyWarn = true;
                  }
               } else if( classNameFromLowThreshold === CLASS_STATUS_DANGER ) {
                  if( isCurrentReadingField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyDanger = true;
                  }
               }
            }

            if( highThresholds ) {
               classNameFromHighThreshold = checkAgainstHigh();

               if( classNameFromHighThreshold === CLASS_STATUS_WARN ) {
                  if( isCurrentReadingField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
                     anyWarn = true;
                  }
               } else if( classNameFromHighThreshold === CLASS_STATUS_DANGER ) {
                  if( isCurrentReadingField ) {  // The title bar reflects the *current* status, not whether something bad happened in the past
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
            } else {
               updateGraph( panelId, value );
            }

            function updateGraph( panelId, value ) {
               const graphId = panelId + ID_STUB_GRAPH + prop,
                     graph = graphs[panelId][graphId].graph,
                     dataset = graph.data.datasets[0],
                     data = dataset.data,
                     labels = graph.data.labels;

               refreshGraphTheme( panelId, graphId );

               //const labelText = data.length % 10 === 0 ? new Date().toLocaleTimeString( {hour12:true} ) : "";

               if( data.length === 35 ) {
                  labels.shift();
                  data.shift();
               }

               graph.data.labels.push( "" );
               data.push( value );
               graph.update();               
            }

            function setStatusColor( element, className ) {
               element.classList.remove( CLASS_STATUS_NORMAL );
               element.classList.remove( CLASS_STATUS_WARN );
               element.classList.remove( CLASS_STATUS_DANGER );
               element.classList.add( className );
            }

            function checkAgainstLow() {
               let className = CLASS_STATUS_NORMAL;

               if( something(lowThresholds) && something(lowThresholds.danger) && value <= lowThresholds.danger ) {
                  className = CLASS_STATUS_DANGER;
               } else if( something(lowThresholds) && something(lowThresholds.warn) && value <= lowThresholds.warn ) {
                  className = CLASS_STATUS_WARN;
               }

               return className;
            }

            function checkAgainstHigh() {
               let className = CLASS_STATUS_NORMAL;

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

      // Pick the worst outcome as the winning title bar status, and create a notification (if applicable)

      if( showStatusInTitleBar ) {
         if( anyDanger ) {
            titleBar.classList.add( CLASS_STATUS_DANGER );

            if( settings[panelId].notifications ) {
               createThresholdNotification( THRESHOLD_NOTIFICATION_TYPE_DANGER, panelId );
            }
         } else if( anyWarn ) {
            titleBar.classList.add( CLASS_STATUS_WARN );

            if( settings[panelId].notifications ) {
               createThresholdNotification( THRESHOLD_NOTIFICATION_TYPE_WARN, panelId );
            }
         } else {
            titleBar.classList.add( CLASS_STATUS_NORMAL );
         }
      } else {
         titleBar.classList.add( CLASS_STATUS_NONE );
      }
   }

   function thresholdNotificationCloseCallback( event ) {
      thresholdNotifications[ event.target.data.panelId ] = null;
   }

   function createThresholdNotification( type, panelId ) {
      let currNotif = thresholdNotifications[panelId];

      const isFirstNotification = !something( currNotif ),
            isReplacementNotification = !isFirstNotification && currNotif.data.type < type;

      if( isFirstNotification || isReplacementNotification ) {
         if( isReplacementNotification ) {
            currNotif.removeEventListener( "close", thresholdNotificationCloseCallback );
            currNotif.close();
            currNotif = null;
         }

         let icon, title, body, now = new Date();

         const dateOpts = { year : "numeric", month : "long", day : "numeric" };
         const timeOpts = { hour12 : true };

         const dateStr = now.toLocaleDateString( dateOpts ),
               timeStr = now.toLocaleTimeString( timeOpts ),
               dateTimeStr = dateStr + " " + timeStr;

         if( type === THRESHOLD_NOTIFICATION_TYPE_WARN ) {
            icon  = CACHE[ THRESHOLD_NOTIFICATION_ICON_WARN ];
            title = THRESHOLD_NOTIFICATION_TITLE_WARN + settings[panelId].title;
            body  = settings[panelId].title + THRESHOLD_NOTIFICATION_BODY_WARN + dateTimeStr;
         } else if( type === THRESHOLD_NOTIFICATION_TYPE_DANGER ) {
            icon  = CACHE[ THRESHOLD_NOTIFICATION_ICON_DANGER ];
            title = THRESHOLD_NOTIFICATION_TITLE_DANGER + settings[panelId].title;
            body  = settings[panelId].title + THRESHOLD_NOTIFICATION_BODY_DANGER + dateTimeStr;
         } else {
            throw new Error( "Invalid threshold notification type" );
         }

         const newNotif = createNotification( type, panelId, icon, title, body, THRESHOLD_NOTIFICATION_TAG + panelId, true );
         newNotif.addEventListener( "close", thresholdNotificationCloseCallback );
         thresholdNotifications[panelId] = newNotif;
      }
   }

   function createNotification( type, panelId, icon, title, body, tag, requireInteraction ) {
      let notification = null;

      areNotificationsOk();  // If notifications were disabled in the browser when the page loaded, then re-enabled later, we want to know

      if( notificationsOk ) {
         const opts = {
            body : body,
            icon : icon,
            tag  : tag,
            data : { type : type, panelId : panelId },
            requireInteraction : requireInteraction
         };

         notification = new Notification( title, opts );
      }

      return notification;
   }

   function isVisible( element ) {
      return !element.classList.contains( CLASS_VISIBILITY_GONE ) && !element.classList.contains( CLASS_VISIBILITY_HIDDEN );
   }

   function validateSettings( panelId, panelCfg ) {
      const ERR_PREFIX = "Invalid configuration:  ";

      if( !panelId ) {
         throw new Error( "panelId has no value" );
      }

      if( !panelCfg ) {
         throw new Error( ERR_PREFIX + "no configuration was provided" );
      }

      // Initialize a settings object with defaults

      const saved = {};
      saved.url = {};
      saved.url.interval = SETTING_MINIMUM_INTERVAL_SECONDS;
      saved.lowThresholds = {};
      saved.highThresholds = {};
      saved.autoConnect = true;
      saved.startMinimized = false;
      saved.notifications = true;
      saved.fields = {};
      saved.lowThresholds = {};
      saved.highThresholds = {};

      // Validate configuration.  If the property is one that needs to be held onto, save it upon successful validation.

      v( panelCfg.title, "title", "string", true );
      saved.title = panelCfg.title;

      v( panelCfg.url, "url", "object", true );

      v( panelCfg.url.address, "url.address", "string", true );
      saved.url.address = panelCfg.url.address;

      v( panelCfg.url.method,  "url.method",  "string", true  );
      const method = panelCfg.url.method.toUpperCase();
      if( method !== "GET" && method !== "POST" ) { throw new Error(ERR_PREFIX + "url.method must be GET or POST"); }
      saved.url.method = panelCfg.url.method;

      if( method === "POST" ) {
         v( panelCfg.url.postData, "url.postData", "object", true );

         if( !panelCfg.url.postData || Object.keys(panelCfg.url.postData).length < 1 ) {
            throw new Error(ERR_PREFIX + "url.method is POST but url.postData is undefined or has no length");
         }

         saved.url.postData = panelCfg.url.postData;
      }

      v( panelCfg.url.interval, "url.interval", "number", false );
      if( something(panelCfg.url.interval) && panelCfg.url.interval > SETTING_MINIMUM_INTERVAL_SECONDS ) {
         saved.url.interval = panelCfg.url.interval;
      }

      v( panelCfg.autoConnect, "autoConnect", "boolean", false );
      if( something(panelCfg.autoConnect) ) { saved.autoConnect = panelCfg.autoConnect; }

      v( panelCfg.startMinimized, "startMinimized", "boolean", false );
      if( something(panelCfg.startMinimized) ) { saved.startMinimized = panelCfg.startMinimized; }

      v( panelCfg.notifications, "notifications", "boolean", false );
      if( something(panelCfg.notifications) ) { saved.notifications = panelCfg.notifications; }

      v( panelCfg.fields, "fields", "object", true );

      for( let i = 0; i < panelCfg.fields.length; i++ ) {
         const f = panelCfg.fields[i];
         const s = "fields[" + i + "]";

         v( f.prop,   s + ".prop",   "string", true );
         saved.fields[f.prop] = {};

         v( f.label,  s + ".label",  "string", true );
         saved.fields[f.prop].label = f.label;

         v( f.suffix, s + ".suffix", "string", false );
         if( f.suffix ) { saved.fields[f.prop].suffix = f.suffix; }

         const lThresh = f.lowThresholds,
               hThresh = f.highThresholds;

         v( lThresh, s + ".highThresholds", "object", false );

         if( lThresh ) {
            v( lThresh.warn,   s + ".lowThresholds.warn",   "number", false );
            v( lThresh.danger, s + ".lowThresholds.danger", "number", false );

            if( !lThresh.warn && !lThresh.danger ) {
               throw new Error( ERR_PREFIX + s + ".lowThresholds must define .warn, .danger or both" );
            }

            saved.lowThresholds[f.prop] = lThresh;
         }

         v( hThresh, s + ".highThresholds", "object", false );

         if( hThresh ) {
            v( hThresh.warn,   s + ".highThresholds.warn",   "number", false );
            v( hThresh.danger, s + ".highThresholds.danger", "number", false );

            if( !hThresh.warn && !hThresh.danger ) {
               throw new Error( ERR_PREFIX + s + ".highThresholds must define .warn, .danger or both" );
            }

            saved.highThresholds[f.prop] = hThresh;
         }

         v( f.showLowest, s + ".showLowest", "boolean", false );
         saved.fields[f.prop].showLowest = something( f.showLowest ) ? f.showLowest : true;

         v( f.showHighest, s + ".showHighest", "boolean", false );
         saved.fields[f.prop].showHighest = something( f.showHighest ) ? f.showHighest : true;
      }

      return saved;

      function v( field, fieldName, requiredType, isRequired ) {
         if( isRequired ) {
            if( !something(field) ) {
               throw new Error( "Invalid configuration:  property '" + fieldName + "' is required" );
            }
         }

         if( something(field) ) {
            if( typeof field !== requiredType ) {
               throw new Error( "Invalid configuration:  property '" + fieldName + "' must be of type " + requiredType );
            }
         }
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
