sap.ui.define(
  [
    "com/ContactsApp/Application/Base/BaseController",
    "sap/m/MessageToast",
    "com/ContactsApp/Service/Contact.service",
  ],
  function (BaseController, MessageToast, ContactService) {
    "use strict";

    return BaseController.extend(
      "com.ContactsApp.Application.Login.controller.Login",
      {
        onInit: function () {
          const user = {
            eMail: "",
            password: "",
          };
          oModel.setProperty("/user", user);
        },

        onPressLoginBtn: function () {
          let user = oModel.getProperty("/user");
          ContactService.loginContact(user)
            .then((data) => {
              let user = data;
              window.sessionStorage.setItem("user", JSON.stringify(user));
              MessageToast.show("Login is success. Redirecting to Home page!");
              setTimeout(() => {
                this.navTo("Home");
              }, 1200);
            })
            .catch(() => {
              MessageToast.show("Missing or incorrect entry");
            });
        },

        onPressNavToRegisterPage: function () {
          this.navTo("Register");
        },
      }
    );
  }
);
