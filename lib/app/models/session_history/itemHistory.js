export class SFItemHistory {

  constructor(params = {}) {
    if(!this.entries) {
      this.entries = [];
    }

    // Deserialize the entries into entry objects.
    if(params.entries) {
      for(var entryParams of params.entries) {
        var entry = this.createEntryForItem(entryParams.item);
        entry.setPreviousEntry(this.getLastEntry());
        this.entries.push(entry);
      }
    }
  }

  createEntryForItem(item) {
    var historyItemClass = SFItemHistory.HistoryEntryClassMapping && SFItemHistory.HistoryEntryClassMapping[item.content_type];
    if(!historyItemClass) {
      historyItemClass = SFItemHistoryEntry;
    }
    var entry = new historyItemClass(item);
    return entry;
  }

  getLastEntry() {
    return this.entries[this.entries.length - 1]
  }

  addHistoryEntryForItem(item) {
    var prospectiveEntry = this.createEntryForItem(item);

    var previousEntry = this.getLastEntry();
    prospectiveEntry.setPreviousEntry(previousEntry);

    // Don't add first revision if text length is 0, as this means it's a new note.
    // Actually, we'll skip this. If we do this, the first character added to a new note
    // will be displayed as "1 characters loaded"
    // if(!previousRevision && prospectiveRevision.textCharDiffLength == 0) {
    //   return;
    // }

    // Don't add if text is the same
    if(prospectiveEntry.isSameAsEntry(previousEntry)) {
      return;
    }

    this.entries.push(prospectiveEntry);
    return prospectiveEntry;
  }

  clear() {
    this.entries.length = 0;
  }

  optimize() {
    const SmallRevisionLength = 15;
    this.entries = this.entries.filter((entry, index) => {
      // Keep only first and last item and items whos diff length is greater than the small revision length.
      var isFirst = index == 0;
      var isLast = index == this.entries.length - 1;
      var isSmallRevision = Math.abs(entry.textCharDiffLength) < SmallRevisionLength;
      return isFirst || isLast || !isSmallRevision;
    })
  }
}
