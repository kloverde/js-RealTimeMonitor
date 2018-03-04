document.addEventListener( "DOMContentLoaded", function() {
   "use strict";

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

   var THRESHOLD = {
      [LOAD] : { warn : 70, danger : 90 },
      [RPM]  : { warn : 2000, danger : 2500 },
      [AMBIENT_TEMP]  : { warn : 80, danger : 100 },
      [INTERNAL_TEMP] : { warn : 200, danger : 250 },
      [HUMIDITY] : { warn : 75, danger : 85 }
   };

   // A double-dimensioned array used for building the UI.  The first element is the title which displays at the top of the panel;
   // the second is the URL used to refresh the panel.  You can declare as few or as many panels as you wish.
   var ui = [
      [ "Site 1", "http://localhost/RealtimeMonitor/status/site1" ],
      [ "Site 2", "http://localhost/RealtimeMonitor/status/site2" ],
      [ "Site 3", "http://localhost/RealtimeMonitor/status/site3" ]
   ];

   function buildUI() {
      for( var i = 1; i <= ui.length; i++ ) {
         var siteContainer = document.createElement( "div" );
         var log = document.createElement( "textarea" );
         var btnContainer = document.createElement( "div" );
         var btn = document.createElement( "button" );
         var btnValue = document.createTextNode( "Connect Site " + i );

         siteContainer.id = "panel" + i;
         siteContainer.className = "monitoringPanel";

         log.id = "log" + i;

         btnContainer.className = "btnContainer";
         btn.id = "btn" + i;

         btn.addEventListener( "click", function() { btnClick(this) } );
         btn.appendChild( btnValue );
         btnContainer.appendChild( btn );

         siteContainer.appendChild( newField(LOAD + i, "Load:", "%") );
         siteContainer.appendChild( newField(MAX_LOAD + i, "Max Load:", "%") );
         siteContainer.appendChild( newFieldSeparator() );

         siteContainer.appendChild( newField(RPM + i, "RPM:") );
         siteContainer.appendChild( newField(MAX_RPM + i, "Max RPM:") );
         siteContainer.appendChild( newFieldSeparator() );

         siteContainer.appendChild( newField(AMBIENT_TEMP + i, "Ambient Temp:", "°F") );
         siteContainer.appendChild( newField(MAX_AMBIENT_TEMP + i, "Max Ambient Temp:", "°F") );
         siteContainer.appendChild( newFieldSeparator() );

         siteContainer.appendChild( newField(INTERNAL_TEMP + i, "Internal Temp:", "°F") );
         siteContainer.appendChild( newField(MAX_INTERNAL_TEMP + i, "Max Internal Temp:", "°F") );
         siteContainer.appendChild( newFieldSeparator() );

         siteContainer.appendChild( newField(HUMIDITY + i, "Humidity:", "%") );
         siteContainer.appendChild( newField(MAX_HUMIDITY + i, "Max Humidity:", "%") );
         siteContainer.appendChild( newFieldSeparator() );

         siteContainer.appendChild( log );
         siteContainer.appendChild( btnContainer );

         document.body.appendChild( siteContainer );

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
   }

   function getSiteNum( btnId ) {
      return btnId.replace( "btn", "" );
   }

   function btnClick( btn ) {
      var siteNum = getSiteNum( btn.id );
      var connected = btn.innerHTML.indexOf( "Disconnect" ) !== -1;

      if( connected ) {
         disconnect( siteNum );
         btn.innerHTML = "Connect Site " + siteNum;
      } else {
         connect( siteNum );
         btn.innerHTML = "Disconnect Site " + siteNum;
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
      var site = panelData[ "panel" + siteNum ];

      for( var prop in stats ) {
         var maxProp = PREFIX_MAX + prop;
         site[ prop ] = stats[prop];
         site[maxProp] = site[maxProp] >= site[prop] ? site[maxProp] : site[prop];
      }
   }

   function updateUI( siteNum ) {
      var site = panelData[ "panel" + siteNum ];
      var elem;

      for( var prop in site ) {
         var thresholdProp = prop.replace( new RegExp("^" + PREFIX_MAX), "" );
         var value = site[prop];
         var field = document.getElementById( prop + siteNum );

         field.innerHTML = value;

         var container = field.parentNode;
         var className = "normal";

         if( value >= THRESHOLD[thresholdProp].danger ) {
            className = "danger";
         } else if( value >= THRESHOLD[thresholdProp].warn ) {
            className = "warn";
         }

         for( var i = 0; i < container.children.length; i++ ) {
            var child = container.children[ i ];
            child.className = className;
         }
      }
   }

   buildUI();
} );