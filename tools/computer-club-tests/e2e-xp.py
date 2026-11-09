import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a","SAVE":"s","FIND A WORD":"f","BOLD":"b","ITALIC":"i","REDO":"y"}
async def signin(pg, name, pin):
    await pg.goto(SITE+'/computer-club/sign-in/')
    if await pg.is_visible('#switchBtn'): await pg.click('#switchBtn')
    await pg.fill('#codeInput','BYTE7'); await pg.click('#codeBtn')
    await pg.click(f'.name-btn:has-text("{name}")'); await pg.keyboard.type(pin); await pg.wait_for_url(SITE+'/computer-club/')
async def ninja(pg, level):
    await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/')
    await pg.click(f'button[data-level="{level}"]')
    for i in range(10):
        a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
    await pg.wait_for_selector('#saveLine:has-text("Saved")')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        # teacher starts session
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn')
        await pg.wait_for_selector('#dash:not(.hidden)'); await pg.fill('#newCode','BYTE7'); await pg.fill('#newWeek','1'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(600); await pg.click('#missionSwitches .switch'); await pg.wait_for_timeout(600)
        # Ben plays silver once
        await signin(pg,'Ben T.','0042'); await ninja(pg,'silver')
        # Ana plays bronze
        await signin(pg,'Ana R.','1234'); await pg.wait_for_timeout(1200)
        print('bar after signin:', (await pg.inner_text('.cc-xp')).replace('\n',' | '))
        await ninja(pg,'bronze'); await pg.wait_for_timeout(1800)
        print('bar after round:', (await pg.inner_text('.cc-xp')).replace('\n',' | '))
        print('toast:', await pg.locator('.cc-toast').all_inner_texts())
        # sticky: scroll and check bar top
        await pg.mouse.wheel(0,1500); await pg.wait_for_timeout(400)
        print('bar top after scroll:', await pg.evaluate("document.querySelector('.cc-xp').getBoundingClientRect().top"))
        await pg.screenshot(path='shots/xp-sticky.png')
        # hub
        await pg.goto(SITE+'/computer-club/#standings'); await pg.wait_for_timeout(2000)
        print('xp board:', (await pg.inner_text('#boardXp')).replace('\n',' | '))
        print('battle:', (await pg.inner_text('#boardBattle')).replace('\n',' | '))
        await pg.locator('#standings').scroll_into_view_if_needed()
        await pg.screenshot(path='shots/hub-standings.png', full_page=True)
        # level up: give Ana lots via typing (badges) 
        await pg.goto(SITE+'/computer-club/typing-test/')
        await pg.evaluate("CC.submit('/save-typing',{level:'gold',duration_s:120,wpm:36,accuracy:96,errors:2,chars_typed:400})")
        await pg.wait_for_timeout(2500)
        print('bar after typing:', (await pg.inner_text('.cc-xp')).replace('\n',' | '), '| toasts:', await pg.locator('.cc-toast').all_inner_texts())
        # Dev (std4, 0 xp) sees rank and ahead
        await signin(pg,'Dev P.','1111'); await pg.wait_for_timeout(1500)
        print('Dev bar:', (await pg.inner_text('.cc-xp')).replace('\n',' | '))
        await pg.goto(SITE+'/computer-club/#standings'); await pg.wait_for_timeout(1500)
        print('Dev xp board:', (await pg.inner_text('#boardXp')).replace('\n',' | '))
        # teacher
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.wait_for_selector('#dash:not(.hidden)'); await pg.wait_for_timeout(800)
        print('teacher has bar?', await pg.locator('.cc-xp').count())
        print('xp table:', (await pg.inner_text('#xpTable')).replace('\n',' | ')[:400])
        await pg.click('#liveBtn'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='shots/live-board.png')
        await pg.keyboard.press('Escape'); print('live closed:', await pg.is_hidden('#live'))
        # mobile
        await signin(pg,'Ana R.','1234')
        await pg.set_viewport_size({'width':360,'height':760})
        for u,n in [('/computer-club/','hub'),('/computer-club/typing-test/','typing'),('/computer-club/missions/01-shortcut-ninja/','ninja')]:
            await pg.goto(SITE+u); await pg.wait_for_timeout(1500)
            print(n,'360 scrollWidth',await pg.evaluate('document.documentElement.scrollWidth'))
        await pg.screenshot(path='shots/xp-360.png')
        await pg.goto(SITE+'/computer-club/#standings'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='shots/hub-standings-360.png', full_page=True)
        await pg.set_viewport_size({'width':1280,'height':900}); await pg.goto(SITE+'/computer-club/teacher/'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.set_viewport_size({'width':1280,'height':720}); await pg.click('#liveBtn'); await pg.wait_for_timeout(900); await pg.screenshot(path='shots/live-board-720.png')
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
