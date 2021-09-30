sap.ui.define([], function () {
    'use strict';
    return {
        setItem: function (key, data, type) {
            var app = "RECONP";
            var storage = type == "s" ? "sessionStorage" : "localStorage";
            var item = window[storage].getItem(app);
            try {
                var json = JSON.parse(Base64.decode(item))
            }
            catch (err) {
                var json = {
                    time: "5"
                };
            }
            json[key] = data;
            window[storage].setItem(app, Base64.encode(JSON.stringify(json)))
        },
        getItem: function (key, type) {
            var app = "RECONP";
            var storage = type == "s" ? "sessionStorage" : "localStorage";
            var item = window[storage].getItem(app)
            try {
                var json = JSON.parse(Base64.decode(item))
                return json[key];
            } catch (err) {
                return null;
            }
        }
    }
});