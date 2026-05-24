# Tower Battle Intel v4.11u

Current working line: **v4.11u Desktop Column Lead Highlight**.

## Summary
This build starts from v4.11s and keeps the desktop-only Concept 5 direction while giving the Gap in Numbers card a stronger mockup-style treatment with numeric axis values, plus small Quick Actions, meter, and alignment finishing polish.

## Key points
- Desktop dashboard only.
- `mobile.css` remains untouched.
- Runtime version is `v4.11u`.
- Keeps v4.11q compact VS removal.
- Keeps v4.11n DIFF+ details modal.
- Keeps the advantage meter behaviour, but makes the lead wording and meter visuals clearer.
- Full build output only.

## Quick local test
Open PowerShell in this folder and run:

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p==='/')p='/index.html';let f=path.join(root,p);if(!f.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'Content-Type':types[path.extname(f).toLowerCase()]||'application/octet-stream'});res.end(d)}})}).listen(8080,()=>console.log('Open http://localhost:8080'))"
```

Then check:

```javascript
TowerBattleIntel?.version
```

Expected:

```text
v4.11u
```

---

# Tower Battle Intel v4.11g

Current working line: **v4.11g Desktop Height Fit Polish**.

## Summary
This build starts from the working v4.11d desktop Concept 5 top-strip candidate and adds a focused desktop-only height/scroll fit pass.

## Key points
- Desktop dashboard only.
- Mobile CSS remains untouched.
- Runtime version is `v4.11g`.
- No helper patch scripts.
- No external dashboard overlay JS.
- Full build output only.

## What changed from v4.11d
- Kept the v4.11d cyan/gold Run A / Run B trim and VS styling.
- Reduced vertical pressure in maximised and 720p-style desktop windows.
- Shortened dashboard cards slightly without changing the visual direction.
- Tightened side-rail spacing so Quick Actions is less likely to be cut off.
- Tightened recommendation/anomaly text rhythm.
- Added a stronger 1080-height desktop fit rule and kept the existing 720p rule.
- Kept small desktop as compact desktop, not mobile stacking.

## How to test locally
Open PowerShell in this folder and run:

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p==='/')p='/index.html';let f=path.join(root,p);if(!f.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'Content-Type':types[path.extname(f).toLowerCase()]||'application/octet-stream'});res.end(d)}})}).listen(8080,()=>console.log('Open http://localhost:8080'))"
```

Then open:

```text
http://localhost:8080
```

Expected console version:

```javascript
TowerBattleIntel?.version
```

Should return:

```text
v4.11g
```

## Tests
```powershell
node .\tests\browser-interaction-bridge-foundation.test.mjs
node .\tests\current-v4.11g-checkpoint.test.mjs
node .\tests\current-v4.11g-top-strip-fit.test.mjs
node .\tests\current-v4.11g-height-fit.test.mjs
node .\tests\current-v4.11g-save-feedback.test.mjs
node .\tests\diagnostics-foundation.test.mjs
node .\tests\dropdown-collapsible-fix.test.mjs
node .\tests\history-search-focus-fix.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\ui-render-layer.test.mjs
```


## v4.11r Desktop Quick Actions Mockup Rematch

Desktop-only polish pass. Keeps v4.11q compact VS removal, DIFF+ modal, and advantage meter. Reworks Quick Actions to be closer to the Concept 5 mockup with flatter action cards, cleaner title-case labels, lighter line icons, and stronger panel framing. `mobile.css` was not changed.
