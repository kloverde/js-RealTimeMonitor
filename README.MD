RealtimeMonitor
===============

See LICENSE for this software's licensing terms.

This application is still being developed - it's not yet ready for use.

This is a pure JavaScript application (no jQuery, etc.) that displays numeric data from a server in real time.  The basic premise is you define the fields you're expecting to get back, and you get constant updates.  This could be useful for remotely monitoring various types of sensors, etc.  Configuration is provided by a JavaScript object.  The fields are laid out vertically in a panel, and you can create as many panels as you wish.

Optional high and low thresholds can be set on each field.  Each threshold has a warning level and a danger level.  Visual feedback is given if the data falls outside of the established boundaries.

Compatibility is limited to browsers which support [const](https://caniuse.com/#search=const) and [let](https://caniuse.com/#search=let), which means anything loosely modern, including the aging IE 11.


## Color Coding

Assuming you've declared thresholds for a field, each status (normal, warning and danger) has a different color associated with it.  Color coding is used in three ways:

1. The status of the latest reading is represented as a colored square to the left of the field.  The status is determined by comparing the value to the high and low thresholds.

2. The highest & lowest (the historical) readings are displayed as colored text.  These values are also compared against the high and low thresholds.  Unlike the real-time reading, these fields only change color if the values deteriorate to the point that a worse threshold is breached.  In other words, once it reaches 'warning', it can't get back to 'normal', and once it reaches 'danger', it remains there forever.

3.  The color of the titlebar indicates the worst status among the latest readings of all fields.


## Themes

The application includes several alternate color schemes, or themes.  Themes are implemented by alternate stylesheets which override portions of the base stylesheet.  Use of themes requires a supporting browser such as Firefox or IE.  Chrome does not have built-in support for this functionality.  I've read that there are third-party Chrome addons that add this capability, but I haven't looked into it any further than that.

Several different aspects of the panels are changed by theming, but of particular note are the colors used to represent statuses of normal, warning and danger.  Some themes use green/yellow/red while others use green/orange/red, depending on the panel's background color.


## Notifications

If configured, and if your browser supports it, the application will show native system notifications when a warning or danger threshold is reached.

Internet Explorer does not support notifications.

Firefox supports notifications, and they will work if the demo is opened straight from your filesystem.

Chrome supports notifications, but they won't work if the demo is opened straight from your filesystem.  Chrome only displays notifications over HTTPS.  Thankfully, NPM makes it effortless to set up a quick-and-dirty HTTPS server:

```shell
$ npm install http-server -g
$ cd js-RealtimeMonitor
$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
$ http-server --ssl
```


## Third-party Attribution

The [warning](https://pixabay.com/en/sign-triangle-caution-yellow-36071) and [danger](https://pixabay.com/en/sign-triangle-attention-warning-36070) notification icons were provided by Pixabay user [Clker-Free-Vector-Images](https://pixabay.com/en/users/Clker-Free-Vector-Images-3736).
