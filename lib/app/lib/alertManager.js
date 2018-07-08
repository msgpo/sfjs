export class SFAlertManager {

  alert(params) {
    window.alert(params.text);
  }

  confirm(params) {
    return window.confirm(params.text);
  }

}
