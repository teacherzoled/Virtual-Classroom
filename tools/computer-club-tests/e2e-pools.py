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
        await pg.fill('#newCode','WEEKTWO'); await pg.fill('#newWeek','2'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(700)
        await pg.goto(SITE+'/computer-club/typing-test/'); await pg.wait_for_timeout(1200)
        print('theme line:', await pg.inner_text('#themeLine'))
        get="Array.from(document.querySelectorAll('#passage span')).map(s=>s.textContent).join('')"
        golds=set(); 
        for i in range(8):
            await pg.click('button[data-level="gold"]'); t=await pg.evaluate(get); golds.add(t[:60]+'…'+str(len(t)))
            if i==0:
                has2 = ('hardware' in t) and ('software' in t); print('gold has both week-2 paragraphs:', has2, '| length', len(t))
            await pg.click('#quitBtn') if await pg.is_visible('#quitBtn') else None
        print('distinct gold texts in 8 tests:', len(golds))
        await pg.click('button[data-level="silver"]'); t=await pg.evaluate(get); print('silver starts:', t[:120], '| len', len(t)); await pg.click('#quitBtn') if await pg.is_visible('#quitBtn') else None
        await pg.click('button[data-level="bronze"]'); t=await pg.evaluate(get)
        theme=['mouse','screen','monitor','cable','printer','speaker','power','button']; ws=t.split(' ')
        print('bronze words', len(ws), '| theme words', sum(w in theme for w in ws), '| sample:', ' '.join(ws[:18]))
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
