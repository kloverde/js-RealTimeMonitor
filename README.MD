This application will use Web sockets to display data from a remote service in real time.  It gives visual feedback if the data falls outside of defined boundaries.  This software is limited to handling numeric data.

I threw this together because I wanted to play around with Web sockets and other technologies, and I was at a loss for a project idea.  I decided to simulate remote monitoring of an unspecified piece of equipment by returning randomly-generated data.

I'm considering writing multiple front ends.  The current one uses vanilla JavaScript; I might do another in Angular, etc.  I've done enough jQuery projects both personally and professionally, so there definitely won't be a jQuery front end.

With some modification, you can use this code as a starting point for a real application that does real-time web-based monitoring.

You're free to use this software to your heart's content, but because this isn't a "real" application, there will never be a release.  Please don't contact me about this project - I only respond to questions about projects that have releases.

Compatibility is limited to browsers which support 'const' and 'let'.  If the script doesn't work for you, you're overdue for a browser upgrade.

# Color Coding

Assuming you've declared thresholds for a field, each status (normal, warning and danger) has a different color associated with it.  Color coding is used in three ways:

1. The status of the current reading is displayed as a colored square to the left of the field.  The status is determined by comparing the value to the high and low thresholds.

2. The highest & lowest (historical) readings are displayed as colored text.  These values are also compared against the high and low thresholds.  Unlike the real-time reading, these fields only change color if the values deteriorate to the point that a worse threshold is breached.  In other words, once it reaches 'warning', it can't get back to 'normal', and once it reaches 'danger', it's stuck there forever.

3.  The titlebar indicates the worst status among the current readings of all fields.


# Themes

Different colors are used to represent statuses of normal/warning/danger.  Some themes use green/yellow/red while others use green/orange/red, depending on the background color of the panel.