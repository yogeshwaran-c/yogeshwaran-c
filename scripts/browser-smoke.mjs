import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {chromium} from 'playwright-core';import {serveSite} from './serve-site.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const reports=path.join(root,'dist/reports');fs.mkdirSync(reports,{recursive:true});
const {server,origin}=await serveSite(path.join(root,'dist/public'));let browser;const errors=[];
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:process.env.CI?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
 for(const file of ['sitemap.xml','blog/feed.xml']){const response=await context.request.get(origin+'/'+file);assert.equal(response.status(),200);const xml=await response.text();assert.equal(await page.evaluate(source=>new DOMParser().parseFromString(source,'application/xml').querySelectorAll('parsererror').length,xml),0,'Well-formed XML: '+file);}
 const summary=page.locator('.project-more summary').first();await summary.focus();await page.keyboard.press('Space');assert.equal(await page.locator('.project-more').first().getAttribute('open'),'');
 const quote=page.locator('.testimonial-card summary').nth(1);await quote.focus();await page.keyboard.press('Space');assert.equal(await page.locator('.testimonial-card[open]').count(),1);
 const resume=await page.locator('.nav-cta').getAttribute('href');const pdf=await context.request.get(new URL(resume,origin).href);assert.equal(pdf.status(),200);assert.match(pdf.headers()['content-type'],/application\/pdf/);assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');
 assert.match(await page.locator('.contact-chip[href^="mailto:"]').getAttribute('href'),/^mailto:.+@/);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(origin,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>{const range=document.createRange();range.selectNodeContents(document.querySelector('h1 .stroke'));const r=range.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,nameFits:r.left>=0&&r.right<=innerWidth,heroFills:document.querySelector('#work').getBoundingClientRect().top>=innerHeight-1};});
  assert.deepEqual(layout,{overflow:false,nameFits:true,heroFills:true},'Layout at '+width);
  if(width===390){
   await page.locator('#menuBtn').click();assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');await page.locator('#menuBtn').evaluate(el=>{if(document.activeElement!==el)throw Error('Menu focus not returned');});
   await page.screenshot({path:path.join(reports,'mobile.png')});
  }
  if(width===1440)await page.screenshot({path:path.join(reports,'desktop.png')});
 }
 assert.equal(await page.locator('.reveal-pending').count(),0,'Reduced motion must not hide content');
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844},reducedMotion:'reduce'});const staticPage=await noJS.newPage();await staticPage.goto(origin,{waitUntil:'load'});assert.equal(await staticPage.locator('.refresh-project').count(),4);assert.equal(await staticPage.locator('.testimonial-quote').count(),5);assert.equal(await staticPage.locator('.nav-links').isVisible(),true);await noJS.close();
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(reports,'browser.json'),JSON.stringify({passed:true,widths:[1440,768,390,320],checks:['layout','native keyboard disclosures','mobile menu and focus return','resume PDF','contact','reduced motion','no JavaScript'],errors},null,2));console.log('Browser smoke checks passed.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
