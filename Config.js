class Config {
  constructor() {
    this.appName = "Contacts App";
  }

  setTitle() {
    document.title = this.appName;
  }

  setVersion() {
    $.getJSON("version.json").then((json) => {
      this.version = json.version;
    });
  }

  getAppName() {
    return this.appName;
  }

  getVersion() {
    return this.version;
  }
}
