import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a"}
async def card1(pg): return await pg.evaluate("(()=>{const c=document.querySelector('.card.mission[data-week=\"1\"]');return (c.classList.contains('locked')?'LOCKED '+c.dataset.lock:'OPEN')+(c.getAttribute('href')?' +link':'')})()")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        # 1 everything closed
        await pg.goto(SITE+'/computer-club/'); await pg.wait_for_timeout(1200)
        print('CLOSED hub:', await pg.inner_text('#clubBanner'), '| card1:', await card1(pg), '| typing card locked:', await pg.evaluate("document.getElementById('labTyping').classList.contains('locked')"), '| this-week card hidden:', await pg.is_hidden('#labMission'))
        await pg.screenshot(path='shots/hub-closed.png')
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(1000)
        print('CLOSED mission:', await pg.is_visible('#missionLocked'), await pg.inner_text('#lockTitle'))
        await pg.goto(SITE+'/computer-club/typing-test/'); await pg.wait_for_timeout(1000)
        print('CLOSED typing locked:', await pg.is_visible('#typingLocked'))
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','CLUB1'); await pg.click('#codeBtn'); await pg.wait_for_timeout(500)
        print('CLOSED sign-in:', await pg.inner_text('#codeMsg'))
        # 2 teacher opens the club only
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        print('teacher club state:', await pg.inner_text('#clubState'), '| missions:', (await pg.inner_text('#missionSwitches')).replace('\n',' '))
        await pg.click('#clubSwitch'); await pg.wait_for_timeout(600)
        print('after open:', await pg.inner_text('#clubState'), '|', await pg.inner_text('#accessMsg'))
        await pg.screenshot(path='shots/teacher-access.png', clip={'x':0,'y':380,'width':1280,'height':420})
        await pg.goto(SITE+'/computer-club/'); await pg.wait_for_timeout(1200)
        print('CLUB OPEN, mission off -> card1:', await card1(pg), '|', await pg.inner_text('#clubBanner'))
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(1000)
        print('mission page:', await pg.inner_text('#lockTitle'), await pg.is_visible('#missionLocked'))
        # 3 teacher switches mission on
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.wait_for_selector('#dash:not(.hidden)'); await pg.wait_for_timeout(500)
        await pg.click('#missionSwitches .switch'); await pg.wait_for_timeout(600)
        print('mission switch:', (await pg.inner_text('#missionSwitches')).replace('\n',' '))
        await pg.screenshot(path='shots/teacher-access2.png', clip={'x':0,'y':380,'width':1280,'height':420})
        await pg.goto(SITE+'/computer-club/'); await pg.wait_for_timeout(1200)
        print('BOTH ON -> card1:', await card1(pg), '| this-week:', await pg.inner_text('#labTitle'))
        # sign in + start a round, teacher closes mid-round, then finish -> refused
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','CLUB1'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Carla M.")'); await pg.keyboard.type('5555'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(800)
        await pg.click('button[data-level="bronze"]')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(800); print('open save:', await pg.inner_text('#saveLine'))
        await pg.click('#againBtn')
        req=urllib.request.Request('http://localhost:8787/set-access', data=json.dumps({'teacher_code':'TEACH42','club_open':False}).encode(), headers={'Origin':SITE}, method='POST')
        print('teacher closes:', json.loads(urllib.request.urlopen(req).read())['access']['club_open'])
        await pg.wait_for_timeout(100)
        # move the close time back 31 minutes in the mock Sheet, so the save grace is over
        urllib.request.urlopen('http://localhost:8787/__age_close')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(800); print('closed save:', await pg.inner_text('#saveLine'))
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
