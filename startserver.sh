#!/bin/bash

# RealtimeMonitor
# https://www.github.com/kloverde/js-RealtimeMonitor
#
# Copyright (c) 2018, Kurtis LoVerde
# All rights reserved.
#
# Donations:  https://paypal.me/KurtisLoVerde/10
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#     1. This software may not be used by any for-profit entity, whether a
#        business, person, or other, or for any for-profit purpose.
#     2. Redistributions of source code must retain the above copyright
#        notice, this list of conditions and the following disclaimer.
#     3. Redistributions in binary form must reproduce the above copyright
#        notice, this list of conditions and the following disclaimer in the
#        documentation and/or other materials provided with the distribution.
#     4. Neither the name of the copyright holder nor the names of its
#        contributors may be used to endorse or promote products derived from
#        this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCU#ENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


shopt -s expand_aliases
alias echo="echo -e"

pushd $(dirname "$0") > /dev/null


generate() {
   echo "No certificate found.  Generating now...\n"
   openssl req -sha256 -x509 -newkey rsa:4096 -nodes -keyout demo/key.pem -out demo/cert.pem -days 3650

   if [ -f .rnd ]
   then
      rm -f .rnd
   fi

   echo "\nGeneration complete.  Don't use the certificate"
   echo "for anything other than testing.  It was set to"
   echo "expire in 10 years (!) and wasn't secured with"
   echo "a password (!)."
   echo "\n\nChecking dependencies...\n"
}

installDeps() {
   rc=0

   if [ ! -f node_modules/ws ]
   then
      echo "Installing dependencies"
      npm install ws
      rc=${?}
      echo ""
   fi

   return ${rc}
}

startServer() {
   echo "All dependencies are installed\n"
   node demo/server.js
}

main() {
   echo "Checking for certificate and dependencies"

   if [ ! -f demo/cert.pem ]
   then
      generate
   fi

   if [ ! -f demo/key.pem ]
   then
      generate
   fi

   installDeps

   if [ ${?} -eq 0 ]
   then
      startServer
   fi
}

main
