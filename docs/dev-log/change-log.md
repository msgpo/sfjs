0.3.60:
- Modified core conflict handling logic, as documented by sync-log.md.
- SFItemParams will now send up updated_at, as required by the server
- setDirty signature has changed from setDirty(dirty, dontUpdateClientModified) to setDirty(dirty, updateClientModified). That is, we now default to not updating client_updated_at by default. It should only be updated when the user explicitly make a typing change.
- modelManager.importItems properly freezes values before comparing during import.
