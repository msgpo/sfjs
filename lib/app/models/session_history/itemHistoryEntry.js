export class SFItemHistoryEntry {

  constructor(item) {
    // Whatever values `item` has will be persisted, so be sure that the values are picked beforehand.
    this.item = SFItem.deepMerge({}, item);

    if(typeof this.item.updated_at == 'string') {
      this.item.updated_at = new Date(this.item.updated_at);
    }
  }

  setPreviousEntry(previousEntry) {
    this.hasPreviousEntry = previousEntry != null;
  }

  isSameAsEntry(entry) {
    if(!entry) {
      return false;
    }

    var lhs = new SFItem(this.item);
    var rhs = new SFItem(entry.item);
    return lhs.isItemContentEqualWith(rhs);
  }

}
