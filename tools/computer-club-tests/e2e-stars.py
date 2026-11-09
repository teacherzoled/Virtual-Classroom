import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a"}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page()
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.fill('#newCode','TEST1'); await pg.fill('#newWeek','1'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(800)
        await pg.click('#missionSwitches .switch'); await pg.wait_for_timeout(600)
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(800)
        await pg.click('button[data-level="bronze"]')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(500)
        print('result stars:', await pg.inner_text('#resultStars'), '| background star dots:', await pg.evaluate("document.querySelectorAll('#stars .star').length"), '| background text:', repr(await pg.evaluate("document.getElementById('stars').textContent")))
        await pg.screenshot(path='shots/ninja-stars-fixed.png')
        await b.close()
asyncio.run(main())
