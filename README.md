 Topcoat server
===================

About
-------------------
* nodejs server for storing and viewing benchmark results
* you can get more info about the topcoat project at http://topcoat.io
* server is online at http://bench.topcoat.io

To get started
--------------
1. `npm start` to run it
	* `npm install` if you just cloned the repo
	* you need a mongodb started
2. That is all

Running tests locally
---------------------

There is a screencast available: [http://www.youtube.com/watch?v=Mhw4Sf1WWwQ](http://www.youtube.com/watch?v=Mhw4Sf1WWwQ)

1. You need telemetry, more info here https://github.com/topcoat/topcoat/tree/master/test/perf/telemetry
2. You need to start the topcoat-server
3. $ cd topcoat (not the topcoat-server)
4. Run
````
grunt telemetry-submit
````

It will offer step by step instructions on submitting the data. They are sent to http://localhost:3000.
There is a settings.js under ./topcoat/test/perf/telemetry/lib/settings.js where you can change the endpoint.

=======

5. View tests results at (notice the URL params)

````
http://localhost:3000/dashboard [?test=test_name&device=device]
````

or at

````
http://localhost:3000/v2/view/results
````

What you should know
---------------------
* the app looks for a `process.env.PORT` or defaults to port 3000

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
