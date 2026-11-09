import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':720}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page()
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.click('#liveBtn'); await pg.wait_for_timeout(900); await pg.screenshot(path='shots/live-board.png')
        await pg.keyboard.press('Escape'); await pg.click('#projectBtn'); await pg.wait_for_timeout(300); await pg.screenshot(path='shots/projector.png')
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','BYTE7'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Dev P.")'); await pg.keyboard.type('1111'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.set_viewport_size({'width':1280,'height':1100})
        await pg.goto(SITE+'/computer-club/#standings'); await pg.wait_for_timeout(2000)
        await pg.evaluate("document.getElementById('standings').scrollIntoView()"); await pg.wait_for_timeout(500)
        await pg.screenshot(path='shots/hub-standings.png')
        await b.close()
asyncio.run(main())
