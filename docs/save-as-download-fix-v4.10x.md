# v4.10x Save As Download Fix

If Blob download links are prepared but Chrome still does not download anything, this patch uses Chrome's File System Access API on localhost/HTTPS.

For supported browsers, clicking Export/Download now opens a real Save As dialog using `showSaveFilePicker()` and writes the JSON file directly.

Fallbacks remain:

- automatic Blob anchor click
- visible manual link
- visible Save As button in the download shelf

Expected status:

```js
TowerBattleIntelUniversalDownloadBridge.status()
```

Should include:

```text
universalDownloadBridgeVersion: "v4.10x"
savePickerSupported: true
```
