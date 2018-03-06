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
// callback : A function which fires after the panel is updated.  Optional.

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
         var log = document.createElement( "textarea" );
         var btnContainer = document.createElement( "div" );
         var btn = document.createElement( "button" );
         var btnValue = document.createTextNode( "Connect" );

         panelContainer.id = PREFIX_PANEL + i;
         panelContainer.className = "monitoringPanel";

         title.id = "title" + i;
         title.className = "title";
         title.innerHTML = panelCfg.title;

         panelContainer.appendChild( title );

         thresholds[i] = [];
         panelData[PREFIX_PANEL + i] = panelData[PREFIX_PANEL + i] || [];

         for( var j = 0; j < panelCfg.fields.length; j++ ) {
            var fieldCfg = panelCfg.fields[j];

            if( fieldCfg.thresholds ) {
               thresholds[i][fieldCfg.prop] = fieldCfg.thresholds;  // We need to refer to this part of the configuration after the UI is built, so save it
            }

            panelContainer.appendChild( newField(fieldCfg.prop + i, fieldCfg.label, fieldCfg.suffix) );

            if( fieldCfg.showMax ) {
               panelContainer.appendChild( newField(PREFIX_MAX + fieldCfg.prop + i, "Max " + fieldCfg.label, fieldCfg.suffix) );
            }

            panelContainer.appendChild( newFieldSeparator() );

            panelData[PREFIX_PANEL + i][PREFIX_MAX + fieldCfg.prop] = 0;
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

         function newField( id, labelText, suffix ) {
            var container = document.createElement( "div" );
            var label = document.createElement( "label" );
            var val = document.createElement( "span" );

            container.className = "fieldContainer";
            val.id = id;
            label.setAttribute( "for", id );
            label.appendChild( document.createTextNode(labelText) );

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

   function btnClick( btn ) {
      var siteNum = btn.id.replace( "btn", "" );
      var connected = btn.innerHTML.indexOf( "Disconnect" ) !== -1;

      if( connected ) {
         disconnect( siteNum );
         btn.innerHTML = "Connect";
      } else {
         connect( siteNum );
         btn.innerHTML = "Disconnect";
      }
   }

   var simulator = null;

   function connect( siteNum ) {
      simulator = window.setInterval( function() {
         var stats = {
            load : random(50, 100),
            rpm  : random(1500, 2700),
            ambientTemp  : random(70, 75),
            internalTemp : random(175, 260),
            rhinocerous  : 45
         };

         updateStats( siteNum, stats );
         updateUI( siteNum );
      }, 1000 );

      function random( from, to ) {
         return Math.floor( Math.random() * (to - from + 1) ) + from;
      }
   }

   function disconnect( siteNum ) {
      window.clearInterval( simulator );
   }

   function updateStats( siteNum, stats ) {
      var panel = panelData[ PREFIX_PANEL + siteNum ];

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
            var container = field.parentNode;
            var className = "normal";
            var fieldThresholds = panelThresholds[thresholdProp];

            field.innerHTML = value;

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
