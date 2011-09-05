// this code is not generic. It's hard-wired to index.html

SMSMyBus.GeoLoc = function() {
    this.smsmybus = new SMSMyBus();
    this.loc = null;
};
SMSMyBus.GeoLoc.prototype = {
    getloc : function() {
        navigator.geolocation.getCurrentPosition(this.getloc_success, this.getloc_error);
    },
    getloc_success : function(pos) {
        console.log("loc success! ", pos);
        var coords = pos.coords;
        $('#locresult').html("lat/lon: " + coords.latitude + ", " + coords.longitude);
        loc = {lat:coords.latitude, lon:coords.longitude};
    },
    getloc_error : function(err) {
        alert("error: " + err.code + ", " + err.message);
    },
    chooseloc : function() {
        alert("not yet implemented!");
    },
    findstops : function() {
        if (!loc) {
            alert("no location specified yet!");
            return;
        }
        this.smsmybus.getnearbystops(this.getnearbystopsCB, loc.lat, loc.lon);
    },
    getnearbystopsCB : function(jsondata) {
        //console.log("got: ", jsondata);
        var stops = $("#stops");
        stops.html("");
        $.each(jsondata.stop, function(index, value) {
            stops.append("<li>#" + value.stopID + " " + value.intersection + "</li>")
        });
    }
};
geoloc = new SMSMyBus.GeoLoc();
