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
         CLASS_APPLICATION_MENU      = "applicationMenu",
         CLASS_APPLICATION_MENU_ACTIVE = "menuActive",
         CLASS_APPLICATION_MENU_INACTIVE = "menuInactive",
         CLASS_APPLICATION_MENU_ITEM = "applicationMenuItem",
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
         ID_STUB_TITLEBAR_CONTROLS   = "titleBarControls",
         ID_STUB_APP_MENU            = "appMenu",
         ID_STUB_APP_MENU_BUTTON     = "appMenuBtn",
         ID_STUB_MENUITEM_MIN_MAX    = "menuItemMinMax",
         ID_STUB_MENUITEM_MUTE       = "menuItemNotif",
         ID_STUB_MENUITEM_CLOSE      = "menuItemClose",
         ID_STUB_LABEL               = "label",
         ID_STUB_CONNECT_BUTTON      = "btnConnect",
         ID_STUB_GRAPH               = "graph",
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

   const CACHE = [],
         THRESHOLD_NOTIFICATION_ICON_WARN    = "THRESHOLD_NOTIFICATION_ICON_WARN",
         THRESHOLD_NOTIFICATION_ICON_DANGER  = "THRESHOLD_NOTIFICATION_ICON_DANGER";

   let thresholdNotifications = [];
   let notificationsOk = false;
   let settings = {};  // This is a subset of the configuration passed into initialize().  Most of the configuration is single-use, so we don't hold onto it.
   let panelData = {};


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

   /*
    * The UI is created dynamically from a supplied array of objects.  Each array element specifies the configuration
    * of an individual panel; you need to define at least one, and there is no upper limit.  The object has the
    * following members:
    *
    * title : (string) Text displayed at the top of the panel
    * url : (string) The URL used to update the panel
    * autoConnect : (boolean) If true, the panel will connect as soon as it completes initialization
    * startMinimized : (boolean) If true, the panel initializes collapsed down to its title bar
    * notifications : (boolean) When set to true, and if the browser supports it, native system notifications will display when low or high thresholds reach the warning or danger level
    * fields : (object array) Specifies field configuration.  Each element of the array contains the configuration for a single field.  Object members are:
    *          prop   : (string) The property name present in the JSON response - also used in the HTML ID
    *          label  : (string) Text displayed in front of the value
    *          suffix : (string) Text displayed after the value.  Optional.
    *          lowThresholds : (object) An optional object specifying numeric warning and danger levels - used to drive visual feedback.
    *                          warn   : (number) The warning threshold
    *                          danger : (number) The danger threshold
    *          highThresholds : Same idea as lowThresholds
    *          showLowest : (boolean) Specifies whether to display the lowest recorded value for 'prop'.  When set to true,
    *                       the value will appear as a separate field immediately beneath the field being tracked.
    *                       When set to false, the value will still be viewable as a tooltip on the field name.
    *          showHighest : Same idea as showLowest
    */
   this.initialize = function( appCfg ) {
      for( let i = 0; i < appCfg.length; i++ ) {
         panelData[ID_STUB_PANEL + i] = panelData[ID_STUB_PANEL + i] || [];

         const panelCfg = appCfg[i];
         const panel = document.createElement( "div" );
         const graphs = [];

         panel.id = ID_STUB_PANEL + i;
         panel.className = CLASS_MONITORING_PANEL;

         // The settings object gets built piecemeal - as the opportunity arises.
         settings[panel.id] = {};
         settings[panel.id].title = panelCfg.title;
         settings[panel.id].url = appCfg[i].url;
         settings[panel.id].lowThresholds = {};
         settings[panel.id].highThresholds = {};
         settings[panel.id].autoConnect = something( panelCfg.autoConnect ) && panelCfg.autoConnect === true ? true : false;
         settings[panel.id].notifications = panelCfg.notifications;
         settings[panel.id].fields = {};

         const titleBar = document.createElement( "div" );
         titleBar.id = panel.id + ID_STUB_TITLE;
         titleBar.className = CLASS_TITLEBAR;
         const titleBarTitle = document.createElement( "div" );
         titleBarTitle.className = CLASS_TITLEBAR_TITLE;
         titleBarTitle.appendChild( document.createTextNode(panelCfg.title) );

         titleBar.appendChild( titleBarTitle );

         const menuBtn = document.createElement( "img" );
         menuBtn.id = panel.id + ID_STUB_APP_MENU_BUTTON;
         menuBtn.src = "img/menu-icon.png";
         ( function(panelId) {
            menuBtn.addEventListener( "click", function() {toggleApplicationMenu(panelId)} );
         } )( panel.id );

         const titleBarControls = document.createElement( "div" );
         titleBarControls.id = panel.id + ID_STUB_TITLEBAR_CONTROLS;
         titleBarControls.appendChild( menuBtn );
         titleBarControls.classList.add( CLASS_TITLEBAR_CONTROLS )
         titleBarControls.classList.add( CLASS_APPLICATION_MENU_INACTIVE );
         
         titleBar.appendChild( titleBarControls );
         panel.appendChild( titleBar );

         const appMenu = document.createElement( "div" );
         appMenu.id = panel.id + ID_STUB_APP_MENU;
         appMenu.className = CLASS_APPLICATION_MENU;
         appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_CONNECT_BUTTON,   TEXT_MENUITEM_CONNECT,  function(){connectDisconnect(panel.id);}) );
         appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_MIN_MAX, TEXT_MENUITEM_MINIMIZE, function(){ minimizeMaximize(panel.id);}) );
         appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_MUTE,    TEXT_MENUITEM_MUTE,     function(){}) );
         appMenu.appendChild( newAppMenuItem(panel.id, ID_STUB_MENUITEM_CLOSE,   TEXT_MENUITEM_CLOSE,    function(){close(panel.id);}) );

         panel.appendChild( appMenu );

         const fieldsContainer = document.createElement( "div" );
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

            settings[panel.id].fields[fieldCfg.prop] = {};  // More opportunistic saving of settings

            if( fieldCfg.showLowest ) {
               fieldsContainer.appendChild( newField(FIELD_TYPE_LOWEST, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );
               settings[panel.id].fields[fieldCfg.prop].showLowest = true;
            } else {
               settings[panel.id].fields[fieldCfg.prop].showLowest = false;
            }

            if( fieldCfg.showHighest ) {
               fieldsContainer.appendChild( newField(FIELD_TYPE_HIGHEST, fieldCfg.prop, panel.id, fieldCfg.label, fieldCfg.suffix) );
               settings[panel.id].fields[fieldCfg.prop].showHighest = true;
            } else {
               settings[panel.id].fields[fieldCfg.prop].showHighest = false;
            }

            panelData[ID_STUB_PANEL + i][fieldCfg.prop] = null;
            panelData[ID_STUB_PANEL + i][PROP_STUB_LOWEST + fieldCfg.prop] = null;
            panelData[ID_STUB_PANEL + i][PROP_STUB_HIGHEST + fieldCfg.prop] = null;

            fieldsContainer.appendChild( newFieldSeparator() );
            graphs.push( newGraph(panel.id, fieldCfg.prop) );
         }

         panel.appendChild( fieldsContainer );

         const graphContainer = document.createElement( "div" );
         graphContainer.className = CLASS_GRAPH_CONTAINER;

         panel.appendChild( graphContainer );

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

      function newAppMenuItem( panelId, menuItemIdStub, text, clickCallback ) {
         const item = document.createElement( "div" );

         item.id = panelId + menuItemIdStub;
         item.className = CLASS_APPLICATION_MENU_ITEM;
         item.appendChild( document.createTextNode(text) );
         item.addEventListener( "click", function() {
            clickCallback();
            toggleApplicationMenu( panelId );
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

      function newButton( id, text ) {
         const btn = document.createElement( "button" );
         btn.id = id;
         btn.appendChild( document.createTextNode(text) );
         return btn;
      }
   };

   this.toggleNotifications = function( panelId ) {
      settings[panelId].notifications = !settings[panelId].notifications;
   };

   this.setNotificationsEnabled = function( enabled ) {
      settings[panelId].notifications = enabled;
   }

   function toggleApplicationMenu( panelId ) {
      const titleBarControls = document.getElementById( panelId + ID_STUB_TITLEBAR_CONTROLS );
      const menu = document.getElementById( panelId + ID_STUB_APP_MENU );

      if( menu && titleBarControls ) {
         if( menu.classList.contains(CLASS_VISIBILITY_HIDDEN) ) {
            menu.classList.remove( CLASS_VISIBILITY_HIDDEN );
            titleBarControls.classList.add( CLASS_APPLICATION_MENU_ACTIVE );
         } else {
            menu.classList.add( CLASS_VISIBILITY_HIDDEN );
            titleBarControls.classList.remove( CLASS_APPLICATION_MENU_ACTIVE );
         }
      }
   }

   function minimizeMaximize( panelId ) {
      const panel = document.getElementById( panelId ),
            menuItem = document.getElementById( panelId + ID_STUB_MENUITEM_MIN_MAX );

      if( panel.classList.contains(CLASS_MINIMIZED) ) {
         panel.classList.remove( CLASS_MINIMIZED );
         menuItem.innerHTML = TEXT_MENUITEM_MINIMIZE;
      } else {
         panel.classList.add( CLASS_MINIMIZED );
         menuItem.innerHTML = TEXT_MENUITEM_MAXIMIZE;
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
      const connected = btn.innerHTML.indexOf( TEXT_MENUITEM_DISCONNECT ) !== -1;

      if( connected ) {
         disconnect( panelId );
         btn.innerHTML = TEXT_MENUITEM_CONNECT;
      } else {
         connect( panelId );
         btn.innerHTML = TEXT_MENUITEM_DISCONNECT;
      }
   }

   let simulators = [];

   function connect( panelId ) {
      if( !simulators[panelId] ) {
         simulators[panelId] = window.setInterval( function() {
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
      }

      function random( from, to ) {
         return Math.floor( Math.random() * (to - from + 1) ) + from;
      }
   }

   function disconnect( panelId ) {
      window.clearInterval( simulators[panelId] );
      simulators[panelId] = null;

      if( thresholdNotifications ) {
         const notif = thresholdNotifications[panelId];

         if( notif ) {
            notif.close();
         }
      }
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
            const label = document.getElementById( ID_STUB_LABEL + panelId + prop );

            const isLowField  = prop.indexOf( PROP_STUB_LOWEST ) === 0,
                  isHighField = !isLowField && prop.indexOf( PROP_STUB_HIGHEST ) === 0;

            const fieldStatus = document.getElementById( panelId + ID_STUB_STATUS + prop );

            let classNameFromLowThreshold  = null,
                classNameFromHighThreshold = null,
                winningClassName = lowThresholds || highThresholds ? CLASS_STATUS_NORMAL : CLASS_STATUS_NONE;

            label.title = "";
            field.innerHTML = "";
            field.appendChild( document.createTextNode(value) );

            if( !isHighField && !isLowField ) {
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
            throw "Invalid threshold notification type";
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
         var opts = {
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
