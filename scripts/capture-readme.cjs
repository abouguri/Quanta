// First build extension with `npm run build --prefix extension` and start the app on port 4317.
// Requires Playwright and its Chromium browser. Run against the local app: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/capture-readme.cjs
// Report and extension states use illustrative fixtures, never live API verdicts.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const path = require('node:path')
const base = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:4317'
const out = path.resolve('docs/screenshots')
const claim = (text, verdict) => ({claim:{text, context:'Illustrative documentation sample',topic:'Science'},verdict,confidence:verdict === 'UNVERIFIED'?'low':'high',source:'llm_assessment',summary:'Sample assessment for the interface preview. This fixture demonstrates how the report presents a verdict and its provenance; it is not a live fact-check.'})
const high = {version:2,tier:'paid',overallScore:93,analyzedAt:1788912000000,metadata:{title:'A closer look at the science behind solar energy',source:'bbc.com',publishedDate:'2026-09-09'},structural:{score:85,flags:[{type:'missing_author',severity:'medium',description:'No author byline was found.'}],metrics:{hasAuthor:false,hasDate:true,capsRatio:0.01,exclamationDensity:0,suspiciousDomain:false,articleLength:3200}},claims:[claim('Solar panels convert sunlight into electricity.','TRUE'),claim('Solar output varies with weather and daylight.','TRUE'),claim('Battery storage can supply energy after sunset.','TRUE'),claim('The project will power every home in the region.','UNVERIFIED'),claim('Installation costs will fall by half next year.','UNVERIFIED')]}
const low = {...high,overallScore:52,metadata:{title:'MIRACLE ENERGY DEVICE: UNLIMITED POWER!!!'},structural:{score:40,flags:[{type:'missing_author',severity:'medium',description:'No author byline was found.'},{type:'missing_date',severity:'low',description:'No publication date was found.'},{type:'excessive_caps',severity:'high',description:'An unusually high proportion of words are uppercase.'},{type:'excessive_exclamations',severity:'medium',description:'Frequent exclamation marks suggest sensational framing.'}],metrics:{hasAuthor:false,hasDate:false,capsRatio:0.6,exclamationDensity:0.05,suspiciousDomain:false,articleLength:1800}},claims:[claim('This device creates energy from nothing.','FALSE'),claim('The device produces unlimited electricity without an energy source.','FALSE'),claim('Thousands of households have already installed it.','UNVERIFIED')]}
async function main(){
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']})
 const context = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce'})
 await context.addInitScript(()=>localStorage.setItem('theme','light'))
 const page = await context.newPage()
 page.setDefaultNavigationTimeout(60000)
 const settle = async()=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200)}
 const shot = async(name,locator)=>{await settle();await (locator||page).screenshot({path:path.join(out,name+'.png'),animations:'disabled'})}
 if(!process.env.SCREENSHOT_EXTENSION_ONLY){
 await page.goto(base);await settle()
 if(await page.title()!=='Quanta | Truth, measured.')throw Error('Unexpected tab title')
 await page.mouse.move(1350,920);await shot('app-input')
 // Verify the full cursor-driven color range while capturing the current UI.
 for(const [x,y,color] of [[0,0,'rgb(242, 160, 160)'],[720,500,'rgb(230, 180, 92)'],[1430,990,'rgb(127, 214, 169)']]){
  await page.mouse.move(x,y);await page.waitForTimeout(400)
  const actual=await page.locator('div.mono').filter({hasText:/^\d{2,3}$/}).evaluate(el=>getComputedStyle(el).color)
  if(actual!==color)throw Error(`Reading color ${actual} != ${color}`)
 }
 let result=high
 await page.route('**/api/analyze',async route=>{
  await page.waitForTimeout(3500)
  await route.fulfill({contentType:'text/event-stream',body:`data: ${JSON.stringify({step:'structural',label:'Checking structural signals',progress:30})}\n\ndata: ${JSON.stringify(result)}\n\n`})
 })
 async function report(data){result=data;await page.goto(base);if(data===low){await page.locator('#tab-text').click();await page.locator('#article-text').fill('MIRACLE ENERGY DEVICE: UNLIMITED POWER!!! '.repeat(40));await page.locator('#panel-text button').click()}else{await page.locator('#article-url').fill('https://www.bbc.com/news/sample-solar-energy');await page.locator('#article-url').press('Enter')};}
 await report(high);await shot('analyzing');await page.getByRole('heading',{name:high.metadata.title}).waitFor();await shot('report-high');await page.screenshot({path:path.join(out,'report-high-full.png'),fullPage:true,animations:'disabled'})
 await shot('claims',page.locator('section').filter({has:page.getByText('Solar panels convert sunlight into electricity.',{exact:true})}).last())
 const details=page.locator('section section').last()
 await shot('source-dossier',details.locator(':scope > div > div').last())
 await report(low);await page.getByRole('heading',{name:low.metadata.title}).waitFor();await shot('report-low');await page.screenshot({path:path.join(out,'report-low-full.png'),fullPage:true,animations:'disabled'});await shot('red-flags',page.locator('section section').last())
 await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.evaluate(()=>window.scrollTo(0,0));await shot('report-dark')
 await page.goto(base+'/landing');await shot('landing')
 }
 // Serve the actual built extension popup with a browser API fixture.
 await page.route('http://extension.test/**',async route=>{
 const file=path.resolve('extension/dist',new URL(route.request().url()).pathname.slice(1)||'index.html')
 await route.fulfill({path:file,contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':undefined})
 })
 await page.addInitScript(({high})=>{
 const values={quanta_install_id:'readme-preview'};let listener;
 window.chrome={tabs:{query:async()=>[{id:1,url:'https://www.bbc.com/news/sample-solar-energy'}],sendMessage:async()=>({title:high.metadata.title,url:'https://www.bbc.com/news/sample-solar-energy',textContent:'Sample article text. '.repeat(100),byline:'Science desk',siteName:'BBC',length:2100})},storage:{local:{get:async key=>({[key]:values[key]}),set:async data=>Object.assign(values,data)}},runtime:{connect:()=>({onMessage:{addListener:fn=>listener=fn},onDisconnect:{addListener:()=>{}},disconnect:()=>{},postMessage:()=>{window.screenshotProgress=()=>listener({type:'PROGRESS',progress:45,pass:2});window.screenshotResult=()=>listener({type:'RESULT',data:high})}})}}
 },{high})
 await page.setViewportSize({width:380,height:700});await page.goto('http://extension.test/index.html');await shot('extension-idle',page.locator('.shell'))
 await page.getByRole('button',{name:/measure|analy[sz]e/i}).first().click();await page.waitForFunction(()=>typeof window.screenshotProgress==='function');await page.evaluate(()=>window.screenshotProgress());await shot('extension-measuring',page.locator('.shell'));await page.evaluate(()=>window.screenshotResult());await page.getByRole('button',{name:/analy[sz]e another|measure another|new analysis/i}).waitFor();await shot('extension-result',page.locator('.shell'))
 await browser.close();console.log(process.env.SCREENSHOT_EXTENSION_ONLY ? 'Captured 3 extension screenshots.' : 'Captured all 14 README screenshots; title and score colors verified.')
}
main().catch(error=>{console.error(error);process.exit(1)})
