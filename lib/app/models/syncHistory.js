export class SFSyncHistory extends SFItem {

  constructor(json_obj) {
    super(json_obj);
  }

  addSyncResponse(response) {
    if(!this.content.entries) {
      this.content.entries = [];
    }
    var entry = this.entryFromResponse(response);
    this.content.entries.push(entry)
  }

  entryFromResponse(response) {
    var savedItems = response.saved_items.map((item) => {
      // create a copy
      return new SFItem(item);
    })

    var retrievedItems = response.retrieved_items.map((item) => {
      // create a copy
      return new SFItem(item);
    })

    return {
      date: new Date(),
      saved_items: savedItems || [],
      retrieved_items: retrievedItems || []
    }
  }

  entries() {
    return this.content.entries;
  }

  clear() {
    this.content.entries = [];
  }

}
