sap.ui.define([], function () {
  "use strict";

  const apiUrl = "http://localhost:41614/api/contacts/";
  return {
    getContactList: function () {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", apiUrl, true);
        xhr.onload = () => {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(Error(xhr.statusText));
          }
        };
        xhr.onerror = () => {
          reject(Error("error fetching JSON data"));
        };
        xhr.send();
      });
    },

    addContact: function (contact) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiUrl, true);
        xhr.onload = () => {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(Error(xhr.statusText));
          }
        };
        xhr.onerror = () => {
          reject(Error("error fetching JSON data"));
        };
        const jsonData = JSON.stringify(contact);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(jsonData);
      });
    },

    updateContact: function (contact) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", `${apiUrl}${contact.id}`, true);
        xhr.onload = () => {
          if (xhr.status == 200) {
            resolve(contact);
          } else {
            reject(Error(xhr.statusText));
          }
        };
        xhr.onerror = () => {
          reject(Error("error fetching JSON data"));
        };
        const data = Object.assign({}, contact);
        delete data.id;
        const jsonData = JSON.stringify(data);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(jsonData);
      });
    },

    deleteContact: function (contactId) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("DELETE", `${apiUrl}${contactId}`, true);
        xhr.onload = () => {
          if (xhr.status == 200) {
            resolve();
          } else {
            reject(Error(xhr.statusText));
          }
        };
        xhr.onerror = () => {
          reject(Error("error fetching JSON data"));
        };
        xhr.send();
      });
    },

    loginContact: function (contact) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiUrl}login`, true);
        xhr.onload = () => {
          if (xhr.status == 200) {
            resolve(xhr.response);
          } else {
            reject(Error(xhr.statusText));
          }
        };
        xhr.onerror = () => {
          reject(Error("error fetching JSON data"));
        };
        const jsonData = JSON.stringify(contact);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(jsonData);
      });
    },
  };
});
