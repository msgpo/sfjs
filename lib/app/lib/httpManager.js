var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class SFHttpManager {

  constructor(timeout) {
    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(globalScope);
  }

  setJWTRequestHandler(handler) {
    this.jwtRequestHandler = handler;
  }

  async setAuthHeadersForRequest(request) {
    var token = await this.jwtRequestHandler();
    if(token) {
      request.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }

  async postAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("post", url, params, onsuccess, onerror);
  }

  async patchAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("patch", url, params, onsuccess, onerror);
  }

  async getAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("get", url, params, onsuccess, onerror);
  }

  async httpRequest(verb, url, params, onsuccess, onerror) {
    return new Promise(async (resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
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
               resolve(response);
             })
           } else {
             console.error("Request error:", response);
             this.$timeout(function(){
               onerror(response, xmlhttp.status)
               reject(response);
             })
           }
         }
        }

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
    })
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
