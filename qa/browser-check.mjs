// Optional portable replay. Install Playwright separately; the static site itself has no npm dependencies.
import fs from 'node:fs';import assert from 'node:assert/strict';
const moduleName=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=await import(moduleName);
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const base=process.env.BASE_URL||'http://127.0.0.1:4176/';const results=[];
try{
 for(const width of[1280,1400,1920,360,390,430]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>window.icecubeQA?.snapshot().webgl);
  if(width<761)await page.locator('.mobile-sheet > summary').click();
  const before=await page.evaluate(()=>window.icecubeQA.snapshot());await page.locator('#start-event').click();await page.locator('#timeline').press('End');await page.locator('#show-candidate').check();
  const track=await page.evaluate(()=>window.icecubeQA.snapshot());assert.equal(track.simulationCalls,before.simulationCalls);assert(track.warningVisible&&track.candidateVisible);assert.equal(await page.locator('#candidate-toggle-label').innerText(),'顯示 LineFit 示意（可能失敗／反向）');assert(await page.locator('#viewport-warning').isVisible());
  await page.locator('[data-type="cascade"]').click();await page.locator('#final-step').click();const cascade=await page.evaluate(()=>window.icecubeQA.snapshot());assert.equal(cascade.reco.fitDirection,null);assert.equal(cascade.reco.fitSpeed,null);assert.equal(cascade.qa.angularError_deg,null);assert.equal(cascade.reco.directionStatus,'NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL');assert.equal(await page.locator('#story-title').innerText(),'⑤ 頂點與光分布');assert.equal(await page.locator('#candidate-toggle-label').innerText(),'顯示電荷重心示意');
  const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));assert(size.scrollWidth<=size.width);await page.locator('#energy').fill('0');await page.locator('#generate').click();assert((await page.locator('#input-error').innerText()).includes('INVALID_INPUT'));
  assert.deepEqual(errors,[]);results.push({width,status:'PASS',track,cascade,size});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await page.goto(base);await page.waitForFunction(()=>window.icecubeQA?.snapshot().webgl);await page.locator('#start-event').click();await page.locator('#diagnostics-toggle').click();
 for(const [seed,error] of[[40003618,123.19798699753869],[7006668,98.00973157529418],[7003149,122.23324681446097]]){await page.locator('#fixture').selectOption(String(seed));await page.locator('#load-fixture').click();await page.waitForFunction(s=>window.icecubeQA.snapshot().exactInput.seed===s,seed);const r=await page.evaluate(()=>window.icecubeQA.snapshot());assert(Math.abs(r.qa.angularError_deg-error)<1e-9);assert(r.qa.hemisphereFlip);results.push({test:'exact '+seed,status:'PASS',result:r});}
 const calls=await page.evaluate(()=>window.icecubeQA.snapshot().simulationCalls);await page.locator('#test-context').click();await page.waitForFunction(()=>window.icecubeQA.snapshot().contextEvents.some(e=>e.state==='RESTORED'));assert.equal(await page.evaluate(()=>window.icecubeQA.snapshot().simulationCalls),calls);results.push({test:'WebGL recovery',status:'PASS'});
 await page.close();fs.mkdirSync('qa/results',{recursive:true});fs.writeFileSync('qa/results/browser-replay.json',JSON.stringify(results,null,2));console.log('Browser semantic replay PASS');
}finally{await browser.close();}
