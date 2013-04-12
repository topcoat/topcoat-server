 Topcoat server
===================

About
-------------------
* nodejs server for storing and viewing benchmark results
* you can get more info about the topcoat project at http://topcoat.io
* server is online at http://bench.topcoat.io

Running tests locally
---------------------
1. You need a mongodb
2. You need telemetry, more info here https://github.com/topcoat/topcoat/tree/master/test/perf/telemetry
3. You need to point the Grunt task (from the topcoat repo) to localhost
   * either export 2 variables path
       * TOPCOAT_BENCHMARK_SERVER (localhost)
       * TOPCOAT_BENCHMARK_PORT (3000 is default)
   * or go in settings.js (from the topcoat repo) and change the settings there
4. Example command
````
grunt telemetry-submit --path=/tmp/telemetry_output.txt --type=snapshot --device=mbp --test=test_name
````
5. View tests results at (notice the URL params & the params for Grunt)
````
http://localhost:3000/dashboard?test=test_name&device=mbp
or at 
http://localhost:3000/v2/view/results
````

What you should know
---------------------
* the app looks for a `process.env.PORT` or defaults to port 3000
* also using the same process var it detects if it's deployed on local or on heroku to use different databases

Copyright and license
---------------------

Copyright (C) 2012 Adobe Systems Incorporated. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above
 copyright notice, this list of conditions and the following
 disclaimer.
2. Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials
 provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
