var LogTracker = (function () {

    function Logger(options = {}) {

        options = Object.assign({
            /** default values */
            namespace: null,
            username: null,
            collectable: true
        }, options)

        this.type = {
            CLIENT: 0,
            SERVICE: 1,
        }

        /**
         * handle client errors
         * @param {String} message 
         * @param {String} details error stack or details
         */
        this.client = function (message, details) {
            _log(this.type.CLIENT, message, details)
        }

        /**
         * handle server errors
         * @param {String} message 
         * @param {String} details error details
         */
        this.service = function (message, details) {
            _log(this.type.SERVICE, message, details)
        }

        this.getLogEntries = function () {
            var logs = StorageHelper.getLogs()
            return logs.slice();
        }

        this.getNamespace = function () {
            return options.namespace;
        }

        this.getUsername = function () {
            if (!options.username) return options.username

            var keys = options.username.split('.')
            return keys.reduce((acc, currVal) => window[acc][currVal]);
        }

        this.getDateTime = function () {
            var today = new Date()
            var GMT = 3
            today.setHours(today.getHours() + GMT)
            return new Date(today).toJSON();
        }

        this.isCollectable = function () {
            return options.collectable;
        }

        this.collectorAwake = function () {
            return DatabaseHelper.collector != null
        }
    }


    function _handleClientErrors() {
        window.onerror = function (message, source, lineno, colno, error) {
            if (error && error.stack) {
                loggerInstance.client(message, error.stack)
            }
        };
    }

    function _handleServiceErrors() {
        var send = window.XMLHttpRequest.prototype.send

        function stateChange(data) {
            this.onreadystatechange = function () {
                if (this.readyState === 4
                    && this.status >= 400 && this.status <= 500
                    && this.responseURL != DatabaseHelper.serviceUrl) {
                    var details = "Request URL: " + this.responseURL
                        + "\nPayload: " + JSON.stringify(data)
                        + "\nResponse: " + this.response
                    loggerInstance.service(this.status, details)
                }
            }

            return send.apply(this, arguments);
        }

        window.XMLHttpRequest.prototype.send = stateChange;
    }

    function _log(type, message, details) {
        var logEntry = {
            namespace: loggerInstance.getNamespace(),
            datetime: loggerInstance.getDateTime(),
            url: window.location.href,
            type: type,
            message: message || "",
            details: details || "",
            user: loggerInstance.getUsername(),
            userAgent: navigator.userAgent
        }
        StorageHelper.addLogs([logEntry])
        _checkCollector()

        return logEntry;
    }

    /**
     * collector ün açık/kapalı olma durumunun kontrolü
     */
    function _checkCollector() {
        if (!loggerInstance.isCollectable()) return

        var logs = StorageHelper.getLogs()
        if (logs.length && DatabaseHelper.collector == null) {
            DatabaseHelper.startCollector()
        }
        else if (!logs.length && DatabaseHelper.collector != null) {
            DatabaseHelper.stopCollector()
        }
    }

    /**
     * boyut olarak kabul edilebilir sınırın üstünde olan logların
     * boyutlarının küçültülmesi
     * @param {JSON} log log entry
     * @returns {JSON} cutted log entry
     */
    function _logCutter(log) {
        var fields = Object.keys(log).map(key => {
            return { key: key, len: log[key].toString().length }
        })
        fields = fields.sort((a, b) => b.len - a.len)

        var index = 0;
        var maxSize = DatabaseHelper.maxBatchSize;
        var refSize = maxSize * 0.1
        while (JSON.stringify(log).length > maxSize) {
            var key = fields[index].key
            var tempLog = log[key].toString()
            
            if (tempLog.length > maxSize) var cutSize = maxSize
            else var cutSize = tempLog.length - refSize

            log[key] = tempLog.substring(0, cutSize)

            if (index == fields.length) index = 0
            else if (tempLog.length <= refSize) index++
        }

        return log
    }

    /**
     * loglar gönderilebilmesi için geçerli boyutta sınırlanıyor
     * @returns {Object} sentLogs, unsentLogs
     */
    function _getLimittedLogs() {
        var logs = StorageHelper.getLogs()
        var sent = []
        logs.every(log => {
            var logSize = JSON.stringify(log).length
            if (logSize > DatabaseHelper.maxBatchSize) log = _logCutter(log)
            
            sent.push(log)
            var sentSize = JSON.stringify(sent).length
            if (sentSize < DatabaseHelper.maxBatchSize) return true
            else {
                sent.pop()
                return false;
            }
        })
        logs.splice(0, sent.length)
        return { 'sentLogs': sent, 'unsentLogs': logs }
    }

    function _collectLogs() {
        var logs = StorageHelper.getLogs()
        if (logs.length) {
            var { sentLogs, unsentLogs } = _getLimittedLogs()
            DatabaseHelper.sendLogs(sentLogs)
                .then(res => {
                    StorageHelper.setLogs(unsentLogs)
                    _checkCollector()
                    console.log('🚚')
                })
                .catch(err => console.log('💥'))
        } else {
            _checkCollector()
        }
    }


    //  Helpers

    var StorageHelper = {
        key: "LOGS",
        /**
         * @param {JSON} logs log entries
         */
        addLogs: function (logs) {
            var items = localStorage.getItem(this.key);
            try {
                var json = JSON.parse(Base64.decode(items))
            }
            catch (err) {
                var json = [];
            }
            json = json.concat(logs);
            localStorage.setItem(this.key, Base64.encode(JSON.stringify(json)))
        },

        /**
         * @param {JSON} logs log entries
         */
        setLogs: function (logs) {
            localStorage.setItem(this.key, Base64.encode(JSON.stringify(logs)))
        },

        /**
         * @returns {JSON} log entries
         */
        getLogs: function () {
            var items = localStorage.getItem(this.key)
            try {
                var json = JSON.parse(Base64.decode(items))
                return json;
            } catch (err) {
                return [];
            }
        },
    }

    var DatabaseHelper = {
        collector: null,
        collectorInterval: 300000,
        maxBatchSize: 100000,
        serviceUrl: "https://log-collector-api.herokuapp.com/logs/create",
        startCollector: function () {
            DatabaseHelper.collector = setInterval(_collectLogs, this.collectorInterval)
        },
        stopCollector: function () {
            clearInterval(DatabaseHelper.collector)
            DatabaseHelper.collector = null
        },

        /**
         * 🚚
         * @param {JSON} logs 
         */
        sendLogs: function (logs) {
            return new Promise((resolve, reject) => {
                var settings = {
                    "url": DatabaseHelper.serviceUrl,
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(logs),
                };

                $.ajax(settings)
                    .done(resolve)
                    .fail(reject)
            })
        }
    }


    var loggerInstance;

    var _static = {

        getInstance: function (options) {
            if (!loggerInstance) {
                if (!options || !options.namespace) throw ("Logger namespace is required");

                loggerInstance = new Logger(options);

                _handleClientErrors()

                _handleServiceErrors()

                _checkCollector()
            }

            return loggerInstance;

        }
    };

    return _static;

})();