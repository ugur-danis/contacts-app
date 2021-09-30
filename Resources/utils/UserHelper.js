sap.ui.define([
    "com/ContactsApp/Service/UserService",
    'com/ContactsApp/Resources/utils/StorageControls',
], function (UserService, StorageControls) {
    "use strict";
    return {
        checkSession: function () {
            return new Promise(function (resolve, reject) {
                var st = StorageControls.getItem("ST");
                if (!st) return reject({ name: "UserError", message: "no session" });

                var lang = StorageControls.getItem("LANG") || "TR";
                UserService.Login(lang)
                    .then(company => {
                        myuser = StorageControls.getItem("USERINFO", "s") || {}
                        if (_.isEmpty(myuser)) reject({ name: "UserError", message: "user info not found" })
                        else {
                            oModel.setProperty("/myuser", myuser);
                            resolve(true)
                        }
                    })
                    .catch(err => {
                        reject({
                            name: "ServerError",
                            message: err.status + ' (' + err.statusText + ')'
                        })
                    });
            });
        },
        /**
         * @param {Boolean} withHash hash ile birlikte veya hash olmadan yönlendirme kontrolü
         */
        goLogin: function (withHash = false) {
            if (withHash && !window.location.hash.includes('Login'))
                oModel.setProperty('/lastHash', window.location.hash.replace("#/", ""))
            else delete oModel.oData.lastHash

            location.replace("/#/Login");
        },
        signOut: function () {
            StorageControls.setItem("USERINFO", {}, "s");
            StorageControls.setItem("COMPANYINFO", {});
            StorageControls.setItem("ST", "");
            myuser = {};
            oModel.setProperty("/myuser", {});
            oModel.setProperty("/company", {});
        },
    }
});