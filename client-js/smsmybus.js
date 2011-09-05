(function() {
    /**
     * Constructor
     * @param devkey optional developer key, overriding any global value specified via SMSMyBus.setDevKey().
     * @param baseurl optional API base URL, overriding any global value specified via SMSMyBus.setDevKey().
     */
    SMSMyBus = function(devkey, baseurl) {
        this.devkey = devkey ? devkey : SMSMyBus.devkey;
        this.baseurl = baseurl ? baseurl : SMSMyBus.baseurl;
        if (!this.devkey)
            console.error("You need a developer key. See http://www.smsmybus.com/api/");
    };
    /**
     * Specify global server values. Optionally, you can instead specify these per-instance.
     * @param devkey a required developer key.  See http://www.smsmybus.com/api/ for details
     * @param baseurl an optional override for the server API URL. Only override this for testing purposes.
     */
    SMSMyBus.setDevKey = function(devkey, baseurl) {
        SMSMyBus.devkey = devkey;
        SMSMyBus.baseurl = baseurl ? baseurl : "http://www.smsmybus.com/api/v1/";
    };
    SMSMyBus.prototype = {
        /**
         * Asynchronously requests real-time arrival estimates for the next N buses at a specified stop.
         *
         * @param callback a function to be invoked asynchronously on completion. On failure, no arguments will be
         *  passed. On success, the raw JSON response will be passed. See the API docs for its format.
         * @param stopID required stop number
         * @param routeID optional route number
         * @param vehicleID optional vehicle number (routeID required if this is specified)
         *
         * @see http://www.smsmybus.com/api/schedule.html#getarrivals
         */
        getarrivals : function (callback, stopID, routeID, vehicleID) {
            var data = {};
            if (stopID) data.stopID = stopID;
            if (routeID) data.routeID = routeID;
            if (vehicleID) data.vehicleID = vehicleID;
            this._invoke("getarrivals", data, callback);
        },

        /**
         *
         * @param callback a function to be invoked asynchronously on completion. On failure, no arguments will be
         *  passed. On success, the raw JSON response will be passed. See the API docs for its format.
         * @param lat
         * @param lon
         * @param radius
         * @param routeID
         * @param destination
         *
         * @see http://www.smsmybus.com/api/locations.html#getnearbystops
         */
        getnearbystops : function (callback, lat, lon, radius, routeID, destination) {
            var data = {lat:lat, lon:lon};
            if (radius) data.radius = radius;
            if (routeID) data.routeID = routeID;
            if (destination) data.destination = destination;
            this._invoke("getnearbystops", data, callback);
        },

        /**
         * Given an SMSMyBus time like "12:44pm" convert to a Javascript Date instance in the local time zone
         * (correcting for the server's time zone). This method only works after a successful server method invocation
         * because we need the server's concept of what time it is "now". This function may produce incorrect results
         * in time spans crossing DST shifts.
         *
         * @param timeStr
         * @returns a Date instance
         */
        timeToDate : function(timeStr) {
            if (!this.timeOffset)
                throw new Error("No reference time recorded yet");
            return new Date(this.timeOffset.local.getTime() + this._parseTimeStr(timeStr) - this._parseTimeStr(this.timeOffset.server));
        },

        _invoke : function(method, data, callback) {
            data.key = this.devkey;
            var t = this;
            $.ajax({
                type: "GET",
                url: this.baseurl + method,
                data: data,
                dataType: 'json',
                crossDomain: true,
                cache: false,
                timeout: 10000,
                success: function(jsondata) {
                    if (jsondata.status != "0") {
                        console.warn("service reported error on " + method +": " + jsondata.description);
                        callback();
                    } else {
                        if (jsondata.timestamp)
                            t._recordTimeOffset(jsondata.timestamp);
                        callback(jsondata);
                    }
                },
                error: function(xhr, status, err) {
                    console.log("call failed to " + method +": " + status, err);
                    callback();
                }
            });
        },
        _parseTimeStr : function(timeStr) {
            var re = /^(\d+):(\d+)(am|pm)$/i;
            var result = re.exec(timeStr);
            if (!result)
                throw new Error("Time string has invalid syntax: " + timeStr);
            var min = result[1] * 60 + result[2];
            if (result[3].toLowerCase() == "pm")
                min += 12 * 60;
            return min * 60000; // convert to milliseconds since midnight, ignoring DST and leap seconds
        },
        _recordTimeOffset : function (timestamp) {
            this.timeOffset = {server: jsondata.timestamp, local: new Date()};
        }

    };
})();
