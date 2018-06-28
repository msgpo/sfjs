class SFHttpManager {

  constructor(storageManager, timeout) {
    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(window);
    this.storageManager = storageManager;
  }

  async setAuthHeadersForRequest(request) {
    var token = await this.storageManager.getItem("jwt");
    if(token) {
      request.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }

  postAbsolute(url, params, onsuccess, onerror) {
    this.httpRequest("post", url, params, onsuccess, onerror);
  }

  patchAbsolute(url, params, onsuccess, onerror) {
    this.httpRequest("patch", url, params, onsuccess, onerror);
  }

  getAbsolute(url, params, onsuccess, onerror) {
    this.httpRequest("get", url, params, onsuccess, onerror);
  }

  async httpRequest(verb, url, params, onsuccess, onerror) {

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        var response = xmlhttp.responseText;
        if(response) {
          try {
            response = JSON.parse(response);
          } catch(e) {}
        }

       if(xmlhttp.status >= 200 && xmlhttp.status <= 299){
         this.$timeout(function(){
           onsuccess(response);
         })
       } else {
         console.error("Request error:", response);
         this.$timeout(function(){
           onerror(response, xmlhttp.status)
         })
       }
     }
   }.bind(this)

    if(verb == "get" && Object.keys(params).length > 0) {
      url = url + this.formatParams(params);
    }

    xmlhttp.open(verb, url, true);
    await this.setAuthHeadersForRequest(xmlhttp);
    xmlhttp.setRequestHeader('Content-type', 'application/json');

    if(verb == "post" || verb == "patch") {
      xmlhttp.send(JSON.stringify(params));
    } else {
      xmlhttp.send();
    }
  }

  formatParams(params) {
    return "?" + Object
          .keys(params)
          .map(function(key){
            return key+"="+encodeURIComponent(params[key])
          })
          .join("&")
  }

}
