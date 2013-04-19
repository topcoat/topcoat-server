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
3. Example
````
grunt telemetry-submit --path=/tmp/smoothness_benchmark_topcoat_buttons.txt --type=snapshot --device=macbook --test=smoothness_benchmark_topcoat_buttons
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
