import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
FUTURE={'on':False}
async def ninja_route(r):
    resp = await r.fetch(); body = await resp.text()
    if FUTURE['on']: body = body.replace('var MISSION_WEEK = 1;', 'var MISSION_WEEK = 3;')
    await r.fulfill(response=resp, body=body)
async def cards(pg):
    return await pg.evaluate("Array.from(document.querySelectorAll('.card.mission')).map(c=>c.dataset.week+':'+(c.classList.contains('locked')?'LOCKED':(c.classList.contains('soon')?'soon':'OPEN'))+(c.getAttribute('href')?'+link':''))")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        await ctx.route('**/missions/01-shortcut-ninja/', ninja_route)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(SITE+'/computer-club/'); await pg.wait_for_timeout(1200)
        print('week1 (signed out):', await cards(pg))
        print('note:', await pg.inner_text('#weekNote'), '| lab:', await pg.inner_text('#labTitle'))
        await pg.evaluate("document.querySelector('.card.mission[data-week=\"2\"]').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
        await pg.screenshot(path='shots/week-lock.png')
        # future mission page at week 1 -> locked
        FUTURE['on']=True
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(1200)
        print('future page locked:', await pg.is_visible('#missionLocked'), await pg.is_hidden('#missionBody'), '|', await pg.inner_text('#lockTitle'))
        await pg.screenshot(path='shots/mission-locked.png')
        # teacher moves to week 3
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.fill('#newCode','WEEK3'); await pg.fill('#newWeek','3'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(600)
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(1200)
        print('future page at week 3 locked?', await pg.is_visible('#missionLocked'))
        FUTURE['on']=False
        await pg.goto(SITE+'/computer-club/'); await pg.wait_for_timeout(1200)
        print('week3:', await cards(pg))
        print('note:', await pg.inner_text('#weekNote'))
        # real week-1 mission still open and saving at week 3
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','WEEK3'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Ana R.")'); await pg.keyboard.type('1234'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(800)
        codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a"}
        await pg.click('button[data-level="bronze"]')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(800); print('save:', await pg.inner_text('#saveLine'))
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
