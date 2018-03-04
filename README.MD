This application will use Web sockets to display data from a remote service in real time.  It gives visual feedback if the data falls outside of defined boundaries.

Unlike most of my projects, this one isn't intended to actually be useful to - or be used by - anyone.  I threw this together because I wanted to play around with Web sockets and other technologies, and I was at a loss for a project idea.  I decided to simulate remote monitoring of an unspecified piece of equipment by returning randomly-generated data.

I'm considering writing multiple front ends.  The current one uses plain JavaScript; I might do another in Angular, etc.  I've done enough jQuery projects both personally and professionally, so there won't be a jQuery front end.

With some modification, you can use this code as a starting point for a real application that does real-time web-based monitoring.

You're free to use this software to your heart's content, but because this isn't a "real" application, there will never be a release.  Please don't contact me about this project - I only respond to questions about projects that have releases.

Known issues:

1.  I knowingly made the front end incompatible with all versions of Internet Explorer.  Naturally, you wouldn't do that in a real application, but I wanted to make use of some ES6 functionality that allows the use of variables as object keys.  (Like I said, the sole purpose of this project was to learn some things).