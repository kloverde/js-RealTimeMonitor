"use strict";

// The UI is created dynamically from a supplied array of objects.  Each array element specifies the configuration
// of a separate panel; you need to define at least one, and there is no upper limit.  The object has the following
// members:
//
// title :  Text displayed at the top of the panel
// url   :  The URL used to update the panel
// fields:  An array of objects specifying field configuration:
//             prop       : The property name present in the JSON response - also used in the HTML ID
//             caption    : Text displayed in front of the value
//             suffix     : Text displayed after the value.  Optional.
//             thresholds : An optional object specifying warning and danger levels - used to drive visual feedback.
//                          Supports only numeric values, so if your data is text you'll have to map it to a number.
//                            warn   : The warning threshold
//                            danger : The danger threshold
//             showMax    : A boolean which specifies whether to display the largest recorded value for 'prop'.
//                          Assumes numeric values, so if your data is text you'll have to map it to a number.
//                          When set to true, the max value will appear as a separate field immediately beneath the
//                          field being tracked.
// callback : A function which fires after the panel is updated.  Optional.

function RealtimeMonitor() {
   var thresholds = [];
   var panelData = [];

   var PREFIX_MAX = "max";

   var LOAD              = "load",
       RPM               = "rpm",
       AMBIENT_TEMP      = "ambientTemp",
       INTERNAL_TEMP     = "internalTemp",
       HUMIDITY          = "humidity",
       MAX_LOAD          = PREFIX_MAX + LOAD,
       MAX_RPM           = PREFIX_MAX + RPM,
       MAX_AMBIENT_TEMP  = PREFIX_MAX + AMBIENT_TEMP,
       MAX_INTERNAL_TEMP = PREFIX_MAX + INTERNAL_TEMP,
       MAX_HUMIDITY      = PREFIX_MAX + HUMIDITY;

   this.buildUI = function( appCfg ) {
      for( var i = 0; i < appCfg.length; i++ ) {
         var panelCfg = appCfg[i];

         var panelContainer = document.createElement( "div" );
         var title = document.createElement( "div" );
         var log = document.createElement( "textarea" );
         var btnContainer = document.createElement( "div" );
         var btn = document.createElement( "button" );
         var btnValue = document.createTextNode( "Connect" );

         panelContainer.id = "panel" + i;
         panelContainer.className = "monitoringPanel";

         title.id = "title" + i;
         title.className = "title";
         title.innerHTML = panelCfg.title;

         panelContainer.append( title );

         thresholds[i] = [];

         for( var j = 0; j < panelCfg.fields.length; j++ ) {
            var fieldCfg = panelCfg.fields[j];

            if( fieldCfg.thresholds ) {
               thresholds[i][fieldCfg.prop] = fieldCfg.thresholds;  // This is the only part of the configuration that we need to refer back to after the UI is built, so save it
            }

            panelContainer.appendChild( newField(fieldCfg.prop + i, fieldCfg.caption, fieldCfg.suffix) );

            if( fieldCfg.showMax ) {
               panelContainer.appendChild( newField(PREFIX_MAX + fieldCfg.prop + i, "Max " + fieldCfg.caption, fieldCfg.suffix) );
            }

            panelContainer.appendChild( newFieldSeparator() );
         }

         log.id = "log" + i;

         btnContainer.className = "btnContainer";

         btn.id = "btn" + i;
         btn.addEventListener( "click", function() { btnClick(this) } );
         btn.appendChild( btnValue );
         btnContainer.appendChild( btn );

         panelContainer.appendChild( log );
         panelContainer.appendChild( btnContainer );

         document.body.appendChild( panelContainer );

         panelData[ "panel" + i ] = {
            [LOAD] : 0,
            [RPM] : 0,
            [AMBIENT_TEMP] : 0,
            [INTERNAL_TEMP] : 0,
            [HUMIDITY] : 0,

            [MAX_LOAD] : 0,
            [MAX_RPM] : 0,
            [MAX_AMBIENT_TEMP] : 0,
            [MAX_INTERNAL_TEMP] : 0,
            [MAX_HUMIDITY] : 0
         };

         i++;

         function newField( id, caption, suffix ) {
            var container = document.createElement( "div" );
            var label = document.createElement( "label" );
            var val = document.createElement( "span" );

            container.className = "fieldContainer";
            val.id = id;
            label.setAttribute( "for", id );
            label.appendChild( document.createTextNode(caption) );

            container.appendChild( label );
            container.appendChild( val );

            if( suffix ) {
               container.appendChild( newSuffix(suffix) );
            }

            return container;
         }

         function newSuffix( suffix ) {
            var elem = document.createElement( "span" );
            elem.className = "hidden";
            elem.innerHTML = suffix;
            return elem;
         }

         function newFieldSeparator() {
            var separator = document.createElement( "div" );
            separator.className = "fieldSeparator";
            return separator;
         }
      }
   };

   function getSiteNum( btnId ) {
      return btnId.replace( "btn", "" );
   }

   function btnClick( btn ) {
      var siteNum = getSiteNum( btn.id );
      var connected = btn.innerHTML.indexOf( "Disconnect" ) !== -1;

      if( connected ) {
         disconnect( siteNum );
         btn.innerHTML = "Connect";
      } else {
         connect( siteNum );
         btn.innerHTML = "Disconnect";
      }
   }

   function connect( siteNum ) {
      var stats = {
         [LOAD] : 70,
         [RPM]  : 500,
         [AMBIENT_TEMP]  : 75,
         [INTERNAL_TEMP] : 200,
         [HUMIDITY] : 45
      };

      updateStats( siteNum, stats );
      updateUI( siteNum );
   }

   function disconnect( siteNum ) {
   }

   function updateStats( siteNum, stats ) {
      var panel = panelData[ "panel" + siteNum ];

      for( var prop in stats ) {
         var maxProp = PREFIX_MAX + prop;
         panel[prop] = stats[prop];
         panel[maxProp] = panel[maxProp] >= panel[prop] ? panel[maxProp] : panel[prop];
      }
   }

   function updateUI( panelNum ) {
      var panelThresholds = thresholds[panelNum];
      var data = panelData[ "panel" + panelNum ];

      for( var prop in data ) {
         var thresholdProp = prop.replace( new RegExp("^" + PREFIX_MAX), "" );
         var value = data[prop];
         var field = document.getElementById( prop + panelNum );

         if( field != null ) {
            field.innerHTML = value;

            var container = field.parentNode;
            var className = "normal";
            var fieldThresholds = panelThresholds[thresholdProp];

            if( fieldThresholds ) {
               if( fieldThresholds.danger && value >= fieldThresholds.danger ) {
                  className = "danger";
               } else if( fieldThresholds.warn && value >= fieldThresholds.warn ) {
                  className = "warn";
               }
            }

            for( var i = 0; i < container.children.length; i++ ) {
               var child = container.children[ i ];
               child.className = className;
            }
         }
      }
   }
}
