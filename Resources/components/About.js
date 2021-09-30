sap.ui.define([
    'sap/m/Dialog',
], function (Dialog, HomeService) {
    'use strict';

    let oControl
    return Dialog.extend('com.ContactsApp.Resources.components.About', {
        metadata: {
            properties: {},
            events: {},
        },
        renderer: {},
        init: function () {
            if (Dialog.prototype.init) Dialog.prototype.init.apply(this, arguments)

            oControl = this;
            oControl.addStyleClass('sapUiContentPadding')

            /** default özellikler atanıyor */
            this.setTitle('Hakkında')
            this.setIcon('sap-icon://hint')
            this.setStretchOnPhone(true)
            this.setDraggable(true)
            this.setContentWidth('20rem')

            /** global nesneler oluşturuluyor */
            this._versionText = this._createVersionText()

            /** content oluşturuluyor */
            let appName = this._getAppNameContent()
            let appVer = this._getAppVersionContent()
            let serviceVer = this._getServiceVersionContent()
            let userAgent = this._getUserAgentContent()
            this.addContent(appName)
            this.addContent(appVer)
            this.addContent(serviceVer)
            this.addContent(userAgent)

            /** buttonlar oluşturuluyor */
            let cancel = this._getCancelButton()
            this.setEndButton(cancel);

            this._getServiceVersion()
        },

        /**
         * @private global views 
         */

        _createVersionText: function () {
            return new sap.m.Text({ busyIndicatorDelay: 0 })
        },

        /**
         * @private content 
         */
        _getAppNameContent: function () {
            return new sap.m.VBox({
                width: '100%',
                items: [
                    new sap.m.Label({ text: 'Application Name:' }),
                    new sap.m.Text({ text: config.getAppName() })
                ]
            }).addStyleClass('sapUiSmallMarginBottom')
        },
        _getAppVersionContent: function () {
            return new sap.m.VBox({
                width: '100%',
                items: [
                    new sap.m.Label({ text: 'Application Version:' }),
                    new sap.m.Text({ text: config.getVersion() })
                ]
            }).addStyleClass('sapUiSmallMarginBottom')
        },
        _getServiceVersionContent: function () {
            return new sap.m.VBox({
                width: '100%',
                items: [
                    new sap.m.Label({ text: 'Service Version:' }),
                    this._versionText
                ]
            }).addStyleClass('sapUiSmallMarginBottom')
        },
        _getUserAgentContent: function () {
            return new sap.m.VBox({
                width: '100%',
                items: [
                    new sap.m.Label({ text: 'User Agent:' }),
                    new sap.m.Text({ text: navigator.userAgent })
                ]
            }).addStyleClass('sapUiSmallMarginBottom')
        },
        _getCancelButton: function () {
            return new sap.m.Button({
                text: 'Kapat',
                press: function () {
                    oControl.close()
                }
            })
        },

        /**
         * @private events 
         */

        _getServiceVersion: function () {
            oControl._versionText.setBusy(true)
            HomeService.Version().then(res => {
                oControl._versionText.setText(res)
                oControl._versionText.setBusy(false)
            })
        },
    })
})
