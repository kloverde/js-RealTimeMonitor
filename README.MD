RealtimeMonitor
===============

See LICENSE for this software's licensing terms.  At first glance, it resembles the BSD-3 license, but it contains a significant difference.  Read it carefully.

This application is still being developed - it's not yet ready for use.

This is a pure JavaScript application (no jQuery, etc.) that displays numeric data from a server in real time.  The basic premise is you define the fields you're expecting to get back, and you get constant updates.  This could be useful for remotely monitoring various types of sensors, etc.  Configuration is provided by a JavaScript object.  The fields are laid out vertically in a panel, and you can create as many panels as you wish.  Current, high and low settings are tracked, and realtime graphs display the last 35 data points for each field.

Optional high and low thresholds can be set on each field.  Each threshold has a warning level and a danger level.  Visual feedback is given if the data falls outside of the established boundaries.

Compatibility is limited to browsers which support [const](https://caniuse.com/#search=const) and [let](https://caniuse.com/#search=let), which means anything loosely modern, including the aging IE 11.


## Color Coding

Assuming you've declared thresholds for a field, each status (normal, warning and danger) has a different color associated with it.  Color coding is used in three ways:

1. The status of the latest reading is represented as a colored square to the left of the field.  The status is determined by comparing the value to the high and low thresholds.

2. The highest & lowest (the historical) readings are displayed as colored text.  These values are also compared against the high and low thresholds.  Unlike the real-time reading, these fields only change color if the values deteriorate to the point that a worse threshold is breached.  In other words, once it reaches 'warning', it can't get back to 'normal', and once it reaches 'danger', it remains there forever.

3.  The color of the titlebar indicates the worst status among the latest readings of all fields.


## Graphs

At the bottom of each panel is an area that contains a line graph for the currently chosen field.  Cycle through the graphs by clicking a field label.

RealtimeMonitor uses [Chart.js](http://chartjs.org) for graphing.  Compatibility has only been verified with Chart.js v2.7.2, the latest available at the time this software was written.  Using a different version could potentially cause a theme's graph colors to malfunction - you'll have to test that yourself.

The graph configurations have been tuned for readability and performance:

1.  Graphs display a maximum of 35 points at a time, after which data points get shifted off the left edge.
2.  All Chart.js animations are disabled.  In Firefox on a Core i7 with one panel containing 4 fields, CPU use often reached 15% with animations enabled (!).  Granted, Firefox isn't the most performant browser out there, but this benchmark wasn't acceptable.  With animations disabled, as well as a few other tweaks, the same test scenario resulted in CPU use of 0-1%.

I contemplated making the Chart.js settings configurable so that these choices are not forced on everyone, but ultimately I decided against it.  I don't recommend changing these settings.


## Notifications

The application can generate system notifications when a warning or danger threshold is reached.  This feature is enabled/disabled through configuration.  The goal behind adding notification support is that you can keep your browser out of view and still know when something requires your attention.

Notification technology is currently evolving.  It's somewhat of a mess right now; there are deprecated APIs and browsers differ greatly in supported capabilities.  IE has no support; Firefox and Chrome support them, but each browser has its own set of annoyances - more on that in a moment.

Each panel displays a notification when one of its warning or danger thresholds is reached.  Because (in my judgement) it's important to not miss one of these events, the code is written so that the notifications are persistent:  they won't close on their own - the user must close them.  A panel cannot have more than one open notification at a time, so unless you have a dozen panels and conditions go south in all of them, you won't get buried in notifications.

Now, onto the caveats.

### Firefox
By default, Firefox ignores the configuration option that makes notifications persistent.  See [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1346375).  To enable persistent notifications, *dom.webnotifications.requireinteraction.enabled* must be set to true in about:config.  So, unless you/your users are going to be staring at panels continuously, or unless you can get them to fiddle with browser configuration, Firefox is probably a poor choice.

### Chrome
Chrome only displays notifications if the page is loaded over HTTPS, so the included demo page won't work if opened straight from your filesystem.  What makes this even *more* fun is that when you open a page straight from your filesystem, Chrome will *ask* for permission to display notifications, but it doesn't actually honor the authorization.  So, if you open the included demo from your filesystem, you'll be endlessly prompted for permission to display notifications.  Thankfully, Node makes it effortless to set up a quick-and-dirty HTTPS server, so you can actually do development work in Chrome:
```shell
$ npm install http-server -g
$ cd js-RealtimeMonitor
$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
$ http-server --ssl
```

Finally, there's the possible annoyance factor.  Every time a panel refreshes, it evaluates whether any of its readings crosses into the warning/danger zone, and if so, it displays a notification.  That means that if the user closes a notification, it can pop right back up the next time the panel refreshes.  Since this could be rather infuriating, the application provides a menu option within each panel to mute/unmute notifications from that panel.  As was mentioned at the beginning of this section, notifications can also be defaulted to off via configuration.


## Themes

The application includes several alternate color schemes, or themes.  Themes are implemented by alternate stylesheets which override portions of the base stylesheet.  Use of themes requires a supporting browser such as Firefox or IE.  Chrome does not have built-in support for this functionality.  I've read that there are third-party Chrome addons that add this capability, but I haven't looked into it any further than that.

Several different aspects of the panels are changed by theming, but of particular note are the colors used to represent statuses of normal, warning and danger.  Some themes use green/yellow/red while others use green/orange/red, depending on the panel's background color.


## Third-party Attribution

The [warning](https://pixabay.com/en/sign-triangle-caution-yellow-36071) and [danger](https://pixabay.com/en/sign-triangle-attention-warning-36070) notification icons were provided by Pixabay user [Clker-Free-Vector-Images](https://pixabay.com/en/users/Clker-Free-Vector-Images-3736).
