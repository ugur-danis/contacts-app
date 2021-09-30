sap.ui.define([
    'com/ContactsApp/Resources/utils/StorageControls',
], function (StorageControls) {
    return {
        ajaxGet: function (apiUrl, serviceName, methodName, params) {
            return new Promise(function (resolve, reject) {
                var st = StorageControls.getItem("ST");
                if (!st) return location.reload();

                var Authorization = "basic " + st;
                serviceName = serviceName ? serviceName + "/" : serviceName
                var url = apiUrl + "/" + serviceName + methodName;
                url += params ? "?" + params : "";
                return $.ajax({
                    "method": "GET",
                    "url": url,
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": Authorization
                    },
                }).done(function (response) {
                    resolve(response);
                }).fail(function (error) {
                    var details = "Request URL:" + url + "\nResponse:" + error.responseText
                    Logger.service(error.status + ' (' + error.statusText + ')', details, myuser.username)
                    switch (error.status) {
                        case 401:
                            window.open("/#/Login", "_self");
                            break;
                    }
                    reject(error);
                });
            });
        },
        ajaxPost: function (apiUrl, serviceName, methodName, jsonData, params) {
            return new Promise(function (resolve, reject) {
                var st = StorageControls.getItem("ST");
                if (!st) return location.reload();

                var Authorization = "basic " + st;
                serviceName = serviceName ? serviceName + "/" : serviceName
                var url = apiUrl + "/" + serviceName + methodName;
                url += params ? "?" + params : "";
                return $.ajax({
                    "method": "POST",
                    "url": url,
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": Authorization
                    },
                    "data": JSON.stringify(jsonData)
                }).done(function (response) {
                    resolve(response);
                }).fail(function (error) {
                    var details = "Request URL:" + url + "\nResponse:" + error.responseText + "\nData: " + JSON.stringify(jsonData)
                    Logger.service(error.status + ' (' + error.statusText + ')', details, myuser.username)
                    switch (error.status) {
                        case 401:
                            window.open("/#/Login", "_self");
                            break;
                    }
                    reject(error);
                });
            });
        },
        xhrBlob: function (apiUrl, serviceName, methodName, jsonData) {
            return new Promise(function (resolve, reject) {
                var st = StorageControls.getItem("ST");
                if (!st) return location.reload();

                var Authorization = "basic " + st;
                serviceName = serviceName ? serviceName + "/" : serviceName
                var url = apiUrl + "/" + serviceName + methodName;

                var xhr = new XMLHttpRequest();

                xhr.open("POST", url);
                xhr.setRequestHeader("Authorization", Authorization);
                xhr.setRequestHeader('Content-Type', "application/json");
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    switch (this.status) {
                        case 200:
                            return resolve(this.response)
                        case 401:
                            window.open("/#/Login", "_self");
                        default:
                            var details = "Request URL: " + url + "\nResponse: " + this.response + "\nData: " + JSON.stringify(jsonData)
                            Logger.service(this.status + ' (' + this.statusText + ')', details, myuser.username)
                            return reject(this);
                    }
                }

                xhr.send(JSON.stringify(jsonData));
            })
        },
    };
});