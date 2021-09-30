jQuery.sap.require("com.ContactsApp.Resources.utils.Router");
sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/resource/ResourceModel",
    "com/ContactsApp/Resources/utils/StorageControls",
    "sap/ui/Device",
    "sap/base/Log",
    "sap/ui/core/IconPool",
  ],
  function (
    UIComponent,
    ResourceModel,
    StorageControls,
    Device,
    Log,
    IconPool
  ) {
    "use strict";

    return UIComponent.extend("com.ContactsApp.Component", {
      metadata: {
        version: "1.0.0",
        routing: {
          config: {
            routerClass: com.ContactsApp.Resources.utils.Router,
            viewType: "XML",
            targetAggregation: "pages",
            clearTarget: false,
          },
          routes: [
            {
              pattern: "Dashboard",
              viewPath: "com.ContactsApp.Application.Dashboard.view",
              view: "Dashboard",
              name: "Dashboard",
              targetControl: "masterAppView",
            },
            {
              pattern: "Login",
              viewPath: "com.ContactsApp.Application.Login.view",
              view: "Login",
              name: "Login",
              targetControl: "masterAppView",
            },
            {
              pattern: "Register",
              viewPath: "com.ContactsApp.Application.Register.view",
              view: "Register",
              name: "Register",
              targetControl: "masterAppView",
            },
            {
              pattern: "Home",
              viewPath: "com.ContactsApp.Application.Home.view",
              view: "Home",
              name: "Home",
              targetControl: "masterAppView",
            },
            {
              viewPath: "com.ContactsApp.Application.NotFound.view",
              pattern: ":all*:",
              name: "NotFound",
              view: "NotFound",
              targetControl: "masterAppView",
              transition: "show",
            },
          ],
        },
      },
      init: function () {
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
        var mConfig = this.getMetadata().getConfig();

        oModel.setProperty("/device", Device); // set device model

        this.seti18nModel();
        this.registerFonts();
        this.setLogTracer();

        // UserHelper.checkSession()
        //     .then(res => this.getRouter().initialize())
        //     .catch(err => {
        //         if (err.name == "UserError" || err.name == "ServerError") {
        //             UserHelper.goLogin(true)
        //         } else {
        //             Log.error(err, err.stack)
        //         }
        this.getRouter().initialize();
        // })
      },
      seti18nModel: function () {
        var lang = StorageControls.getItem("LANG") || "TR";
        sap.ui.getCore().getConfiguration().setLanguage(lang);
        var i18nModel = new ResourceModel({
          bundleName: "com.ContactsApp.i18n.i18n",
        });
        /** custom lang data binding */
        i18nModel
          .getResourceBundle()
          .aPropertyFiles[0].setProperty("Custom", "value");
        this.setModel(i18nModel, "i18n");
        sap.ui.getCore().setModel(i18nModel, "i18n");
      },
      registerFonts: function () {
        IconPool.registerFont({
          fontFamily: "SAP-icons-TNT",
          fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
        });

        IconPool.registerFont({
          fontFamily: "BusinessSuiteInAppSymbols",
          fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/"),
        });
      },
      setLogTracer: function () {
        Log.addLogListener({
          onLogEntry: function (oLogEntry) {
            if (oLogEntry.level === 1) {
              oLogEntry.details =
                typeof oLogEntry.details == "string"
                  ? oLogEntry.details
                  : JSON.stringify(oLogEntry.details);
              Logger.client(
                oLogEntry.message,
                oLogEntry.details,
                myuser.username
              );
            }
          },
        });
      },
      createContent: function () {
        var oViewData = {
          component: this,
        };
        return sap.ui.view({
          viewName: "com.ContactsApp.Application.App.RootApp",
          type: sap.ui.core.mvc.ViewType.XML,
          id: "app",
          viewData: oViewData,
        });
      },
    });
  }
);
