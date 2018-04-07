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

const http  = require( "http" ),
      https = require( "https" ),
      ws    = require( "ws" ),
      url   = require( "url" ),
      fs    = require( "fs" ),
      path  = require( "path" );

const HTTP_PORT  = 8080,
      HTTPS_PORT = 8081;

const httpsOpts = { key  : fs.readFileSync( "demo/key.pem" ),
                    cert : fs.readFileSync( "demo/cert.pem" ) };

const MIME_MAP = {
   ".html" : "text/html",
   ".js"   : "text/javascript",
   ".css"  : "text/css",
   ".png"  : "image/png"
};

const HEADER_TEXT = { "Content-Type" : "text/plain" },
      HEADER_JSON = { "Content-Type" : "application/json" };

const sockets = {};

const httpServer = http.createServer( function(request, response) {
   httpHandler( request, response );
} ).listen( HTTP_PORT );

const httpsServer = https.createServer( httpsOpts, function(request, response) {
   httpHandler( request, response );
} ).listen( HTTPS_PORT );

const wsServer = new ws.Server( {server : httpServer} );

const wssServer = new ws.Server( {server : httpsServer} );

wsServer.on( "connection", function(socket, request) {
   wsOnConnectionHandler( socket, request );
} );

wssServer.on( "connection", function(socket, request) {
   wsHandler( socket, request );
} );

function httpHandler( request, response ) {
   if( !isLocalhost(request, response) ) {
      log( `Denied outside request from ${request.connection.remoteAddress} - ${request.headers.host}` );
      return;
   }

   const parsedUrl = url.parse( request.url, true );
   const pathName = parsedUrl.pathname;

   let postParams = "";

   request.addListener( "data", function(data) {
       postParams += data;
   } );

   request.addListener( "end", function() {
      log( `${request.method}  ${pathName}  ${postParams}` );
   } );

   if( request.method === "GET" ) {
      if( pathName === "/status/site1" ) {
         response.writeHead( 200, HEADER_JSON );
         response.end( randomJson() );
      } else {
         fetchFile( pathName, response );
      }

      return;
   }

   if( request.method === "POST" ) {
      response.writeHead( 200, HEADER_JSON );
      response.end( randomJson() );
   } else {
      response.writeHead( 405, HEADER_TEXT );
      response.end( `Unsupported method:  ${request.method}` );
   }
}

function wsHandler( socket, request ) {
   const channel = request.url.substring( request.url.lastIndexOf("/") + 1 );
   sockets[channel] = sockets[channel] || [];
   sockets[channel].push( socket );

   log( `Socket:  New socket connected to channel ${channel}` );

   socket.on( "message", function(data) {
      log( `Socket:  Received ${data}` );
   } );

   socket.on( "close", function(closeEvent) {
      log( "Socket:  closed: " + closeEvent );
      //delete sockets[channel][?]
   } );
}

let socketInterval = setInterval( function() {
   for( let channel in sockets ) {
      broadcast( channel );
   }
}, 3000 );

function broadcast( channel ) {
   if( sockets[channel] ) {
      const json = randomJson();
      let clients = 0;

      for( let i = 0; i < sockets[channel].length; i++ ) {
         const socket = sockets[channel][i];
         
         if( socket.readyState === ws.OPEN ) {
            socket.send( json );
            clients++;
         }
      }

      log( `SOCK broadcast to ${clients} clients` );
   }
}

function randomJson() {
   const json = JSON.stringify( {
      load         : random( 50, 100 ),
      rpm          : random( 200, 2700 ),
      ambientTemp  : random( 70, 75 ),
      internalTemp : random( 175, 260 ),
      rhinocerous  : 45,  // RealtimeMonitor should continue to function if it encounters an unrecognized property
   } );

   function random( from, to ) {
      return Math.floor( Math.random() * (to - from + 1) ) + from;
   }

   return json;
}

function isLocalhost( request, response ) {
   const host = request.headers.host.replace( /:.*/, "" );

   if( host !== "localhost" ) {
      response.writeHead( 403, HEADER_TEXT );
      response.end( "Connection refused" );
      return false;
   }

   return true;
}

function fetchFile( reqPath, response ) {
   const ext = path.parse( reqPath ).ext;

   reqPath = reqPath.replace( /^\//, "" );

   fs.readFile( reqPath, function(error, data) {
      if( error ) {
         if( error.code === "ENOENT" ) {
            log( `File not found: ${reqPath}` );
            response.writeHead( 404, HEADER_TEXT );
         } else {
            log( error );
            response.writeHead( 500, HEADER_TEXT );
         }

         response.end( `Error retrieving ${reqPath}: ${error}` );
      } else {
         response.setHeader( "Content-type", MIME_MAP[ext] || "text/plain" );
         response.end( data );
      }
   } );
}

function log( msg ) {
   const now = new Date(),
         dateOpts = { year : "numeric", month : "long", day : "numeric" },
         timeOpts = { hour12 : true };

   const dateStr = now.toLocaleDateString( dateOpts ),
         timeStr = now.toLocaleTimeString( timeOpts ),
         dateTimeStr = dateStr + " " + timeStr;

   console.log( dateTimeStr + "  " + msg );
}

console.log( `HTTP  server running at http://localhost:${HTTP_PORT}` );
console.log( `WS    server running at ws://localhost:${HTTP_PORT}\n` );

console.log( `HTTPS server running at https://localhost:${HTTPS_PORT}` );
console.log( `WSS   server running at wss://localhost:${HTTPS_PORT}\n` );
