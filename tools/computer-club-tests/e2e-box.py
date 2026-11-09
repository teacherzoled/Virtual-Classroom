import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.fill('#newCode','BOX1'); await pg.fill('#newWeek','1'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(700)
        for w in (1280, 360):
            await pg.set_viewport_size({'width':w,'height':900})
            await pg.goto(SITE+'/computer-club/typing-test/'); await pg.wait_for_timeout(900)
            await pg.click('button[data-level="gold"]')
            m = await pg.evaluate("(()=>{const b=document.getElementById('passage');const lh=parseFloat(getComputedStyle(b).lineHeight);return {h:b.clientHeight, lh, lines:b.clientHeight/lh}})()")
            print(w, 'box:', m)
            await pg.locator('#passage').screenshot(path=f'shots/box-{w}-start.png')
            text=await pg.evaluate("Array.from(document.querySelectorAll('#passage span')).map(s=>s.textContent).join('')")
            await pg.click('#typeBox'); await pg.keyboard.type(text[:420])
            await pg.wait_for_timeout(300)
            st = await pg.evaluate("(()=>{const b=document.getElementById('passage');const lh=parseFloat(getComputedStyle(b).lineHeight);const c=b.querySelector('span.cur');return {scroll:b.scrollTop, wholeLines:(b.scrollTop/lh), curLineOnScreen:Math.round((c.offsetTop-b.scrollTop)/lh)+1}})()")
            print(w, 'after typing:', st)
            await pg.locator('#passage').screenshot(path=f'shots/box-{w}-typed.png')
            await pg.click('#quitBtn')
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
