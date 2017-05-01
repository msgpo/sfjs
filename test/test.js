class SFTest {

  decryptFiles(files, completion) {

    var mk = "<master key>";
    var keys = SFJS.crypto.generateKeysFromMasterKey(mk);

    var index = 0;
    var processedData = [];

    var readNext = function() {
      var file = files[index];
      index++;
      var reader = new FileReader();

      reader.onload = function(e) {

        var data = JSON.parse(e.target.result);

        // decrypt data
        console.log(data);

        SFItemTransformer.decryptItem(data, keys);
        console.log("Decrypted", data);

        var item = new Item(data);
        console.log("Item:", item);

        if(index < files.length) {
          readNext();
        } else {
          completion({items: processedData});
        }
      }.bind(this)
      reader.readAsText(file);
    }.bind(this);

    readNext();
  }
}

window.SFTest = new SFTest()
