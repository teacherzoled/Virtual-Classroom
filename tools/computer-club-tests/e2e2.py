import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page()
        await pg.goto(SITE+'/'); await pg.wait_for_timeout(2500)
        await pg.locator('p.section-label:has-text("Clubs")').scroll_into_view_if_needed(); await pg.wait_for_timeout(800)
        await pg.screenshot(path='shots/home-club.png')
        await pg.click('a.grade-card[href="/computer-club/"]'); await pg.wait_for_url(SITE+'/computer-club/')
        # sign in Carla, go offline, play, recover -> chip should clear without reload of waiting
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','BYTE7'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Carla M.")'); await pg.keyboard.type('5555'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/')
        codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a","SAVE":"s","FIND A WORD":"f","BOLD":"b","ITALIC":"i","REDO":"y"}
        OFFLINE['on']=True
        await pg.click('button[data-level="silver"]')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(600); print('offline chip:', (await pg.inner_text('#status')).replace('\n',' '))
        OFFLINE['on']=False
        await pg.evaluate('CC.sendUnsent()'); await pg.wait_for_timeout(1200)
        print('after send chip:', (await pg.inner_text('#status')).replace('\n',' '), '| toast:', await pg.locator('.cc-toast').all_inner_texts())
        await b.close()
asyncio.run(main())
