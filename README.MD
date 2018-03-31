RealtimeMonitor
===============

See LICENSE for this software's licensing terms.  At first glance, it resembles the BSD-3 license, but it contains a significant difference which prohibits certain use.  Read it carefully.  Licenses for third-party components used by RealtimeMonitor are in THIRD_PARTY_LICENSES.MD.

This is a pure JavaScript application (no jQuery, etc.) that is used for monitoring numeric data returned by a server.  The data could be from anything at all - industrial equipment, atmospheric sensors... any type of numeric data that you can get into a server is fair game.

The basic premise is you define the fields you're expecting to get back, and you get constant updates.  Optional high and low thresholds can be set on each field.  Each threshold has a warning level and a danger level.  Visual feedback is given if the data falls outside of the established boundaries.

The fields are laid out vertically in a panel, and you can create as many panels as you wish.  Current, highest and lowest values are tracked, and realtime graphs display the last 35 data points for each field.

Configuration is provided by a JavaScript object.  Responses must be formatted as basic JSON - just key/value pairings with no additional required structure.

Compatibility is limited to browsers which support [const](https://caniuse.com/#search=const), [let](https://caniuse.com/#search=let) and [mutation observers](https://caniuse.com/#search=mutationobserver), which means anything loosely modern, including the aging IE 11.

This application is nearing completion, but the API should not be considered stable until an actual release is posted.


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

Each panel displays a notification when one of its warning or danger thresholds is reached.  Because it's important to not miss one of these events, the code is written so that the notifications are persistent:  they won't close on their own - the user must close them.  A panel cannot have more than one open notification at a time, so unless you have a dozen panels and conditions go south in all of them, you won't get buried in notifications.

There *is* a possible annoyance factor, though.  Every time a panel refreshes, it evaluates whether any of its readings crosses into the warning/danger zone, and if so, it displays a notification.  That means that if the user closes a notification, it can pop right back up the next time the panel refreshes.  Since this could be rather infuriating, the application provides a menu option within each panel to mute/unmute notifications from that panel.  As was mentioned at the beginning of this section, notifications can also be defaulted to off via configuration.

Now, onto the browser-specific issues.

### Firefox
By default, Firefox ignores the configuration option that makes notifications persistent.  See [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1346375).  To enable persistent notifications, *dom.webnotifications.requireinteraction.enabled* must be set to true in about:config.  So, unless you/your users are going to be staring at panels continuously, or unless you can get them to fiddle with browser configuration, Firefox is probably a poor choice.

### Chrome
Chrome only displays notifications if the page is loaded over HTTPS - or so I've read.  If that's true, there appears to be an exemption for servers running off of localhost, because I ran it on an insecure local server just fine.


## Themes

The application includes several alternate color schemes, or themes.  Themes are implemented by alternate stylesheets which override portions of the base stylesheet.  Use of themes requires a supporting browser such as Firefox or IE.  Chrome does not have built-in support for this functionality.  I've read that there are third-party Chrome addons that add this capability, but I haven't looked into it any further than that.

Several different aspects of the panels are changed by theming, but of particular note are the colors used to represent statuses of normal, warning and danger.  Some themes use green/yellow/red while others use green/orange/red, depending on the panel's background color.


## Using

Using RealtimeMonitor is pretty simple - there are three steps:

1.  Instantiate RealtimeMonitor
2.  Create a panel via the `newPanel` function
3.  Append the returned DOM object to a container

```javascript
var rtm = new RealtimeMonitor();
var panel = rtm.newPanel( options );
element.appendChild( panel );
```

### Options

The `options` parameter passed into `newPanel` is an object with the following properties:

| Property  | Data Type | Description   | Required ? | Default Value |
|-----------|-----------|---------------|------------|---------------|
| `title`   | string    | Text displayed at the top of the panel | yes | none
|[`url`](#url-property)| object  | Specifies how data is retrieved.  Click the property name to be taken to the definition of this nested object. | yes | none
|`autoConnect`| boolean | If `true`, the panel will connect as soon as it's added to the page | no | true
|`startMinimized`|boolean | If `true`, the panel initializes collapsed down to its title bar | no | false
|`notifications`| boolean | If `true`, and if the browser supports it, native system notifications will display when low or high thresholds reach the warning or danger level | no | ?
|[`fields`](#fields-property)|object array| Specifies field configuration.  Each element of the array contains the configuration for a single field.  Click the property name to be taken to the defnition of this nested object.| yes | none


#### `url` property
| Property  | Data Type | Description   | Required ? | Default Value |
|-----------|-----------|---------------|------------|---------------|
| `address` | string    | The URL used to update the panel.  Supported protocols are http and https. | yes | none
| `method`  | string    | The HTTP method.  Valid values are **GET** and **POST**. | yes | none
| `postData`| object    | Only define this property if `method` is **POST**.  An object consisting of key/value pairs defining fields to be sent in the POST. | varies | none
| `interval`| integer   | The polling interval, in seconds.  The lowest possible value is 3.  Values lower than 3 are overridden to 3. | no | 3

[Back to Options](#options)


#### `fields` property
| Property  | Data Type | Description   | Required ? | Default Value |
|-----------|-----------|---------------|------------|---------------|
| `prop`    | string    | The property name in the JSON response - also used in the HTML ID | yes | none
| `label`   | string    | Text displayed in front of the value | yes | none
| `suffix`  | string    | Text displayed after the value.  Optional. | no | none
| [`lowThresholds`](#thresholds-properties) | object| An optional object specifying numeric warning and danger levels - used to drive visual feedback.  Click the property name to be taken to the definition of this nested object. | no | none
| [`highThresholds`](#thresholds-properties)|object | Same idea as `lowThresholds` | no | none
| `showLowest`| boolean | Specifies whether to display the lowest recorded value for 'prop'.  When set to true, the value will appear as a separate field immediately beneath the field being tracked.  When set to false, the value will still be viewable as a tooltip on the field name. | no | true
|`showHighest`| boolean | Same idea as showLowest | no | true

[Back to Options](#options)


#### `thresholds` properties
| Property  | Data Type | Description   | Required ? | Default Value |
|-----------|-----------|---------------|------------|--------------|
| `warn`    | number    | The warning threshold | Only if `danger` is not defined | none
| `danger`  | number    | The danger threshold  | Only if `warn` is not defined | none

[Back to Fields](#fields-property)
[Back to Options](#options)


See the `demo` directory for in-depth code examples which includes various panel configurations.


## Running the Demo/Development Environment

RealtimeMonitor doesn't have an offline simulator.  To see it process data, you'll need a Web application that returns JSON in response to requests.

In the `demo` directory you'll find a barebones server which does this.  [Install Node.js](https://nodejs.org), then start the server from the **base** directory:

```shell
$ cd js-RealtimeMonitor
$ node demo/server.js
```

By design, the server only honors requests from localhost.

Once the server is running, load http://localhost:8080/demo/demo.html or https://localhost:8080/demo/demo.html in your browser.

HTTP requests are handled by localhost:8080
HTTPS requests are handled by localhost:8081*
*TODO:  Web socket requests are handled by ws://localhost:8082*
*TODO:  Secure Web socket requests are handled by wss://localhost:8083*


## Third-party Attribution

1. Graphs are implemented with [Chart.js](http://www.chartjs.org)

2. The [warning](https://pixabay.com/en/sign-triangle-caution-yellow-36071) and [danger](https://pixabay.com/en/sign-triangle-attention-warning-36070) notification icons were provided by Pixabay user [Clker-Free-Vector-Images](https://pixabay.com/en/users/Clker-Free-Vector-Images-3736).
