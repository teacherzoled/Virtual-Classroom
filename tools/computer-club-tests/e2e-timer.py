import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
SPY = """
window.__snd = {osc:0, buf:0};
const _AC = window.AudioContext;
window.AudioContext = function(){ const a = new _AC(); const o=a.createOscillator.bind(a), b=a.createBufferSource.bind(a);
  a.createOscillator=function(){window.__snd.osc++; return o();}; a.createBufferSource=function(){window.__snd.buf++; return b();}; return a; };
"""
codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a","SAVE":"s","FIND A WORD":"f","BOLD":"b","ITALIC":"i","REDO":"y"}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME, args=['--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route); await ctx.add_init_script(SPY)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        # open club + mission
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.fill('#newCode','TIMER1'); await pg.fill('#newWeek','1'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(700)
        await pg.click('#missionSwitches .switch'); await pg.wait_for_timeout(500)
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','TIMER1'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Ana R.")'); await pg.keyboard.type('1234'); await pg.wait_for_url(SITE+'/computer-club/'); await pg.wait_for_timeout(800)
        # routine cards
        print('routine:', (await pg.inner_text('.grid >> nth=0')).replace('\n',' | ')[:260])
        print('sound btn:', await pg.inner_text('#soundBtn'))
        await pg.click('button[data-timer="Mission"]'); await pg.wait_for_timeout(1200)
        print('pill:', (await pg.inner_text('.cc-timer')).replace('\n',' '))
        await pg.screenshot(path='shots/timer-pill.png')
        # follow to mission page; then make it end in 2 s
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(800)
        print('pill on mission page:', (await pg.inner_text('.cc-timer')).replace('\n',' '))
        await pg.mouse.click(5,400)
        await pg.evaluate("(()=>{const t=JSON.parse(localStorage.getItem('cc-timer')); t.end=Date.now()+61000-59000; localStorage.setItem('cc-timer',JSON.stringify(t));})()")
        await pg.reload(); await pg.mouse.click(5,400); await pg.wait_for_timeout(3500)
        print('flash:', (await pg.inner_text('.cc-flash')).replace('\n',' | ') if await pg.locator('.cc-flash').count() else 'NONE', '| osc', await pg.evaluate('__snd.osc'), '| pill hidden:', await pg.evaluate("document.querySelector('.cc-timer').classList.contains('cc-hidden')"))
        await pg.screenshot(path='shots/flash.png')
        await pg.click('.cc-flash'); 
        # ninja clicks + gold end flash
        await pg.click('button[data-level="gold"]')
        for i in range(6):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.keyboard.press('Control+q')
        print('ninja clicks (buffers):', await pg.evaluate('__snd.buf'))
        await pg.wait_for_timeout(61500)
        print('gold flash:', (await pg.inner_text('.cc-flash')).replace('\n',' | ') if await pg.locator('.cc-flash').count() else 'NONE', '|', (await pg.inner_text('#resultText'))[:200])
        # typing test with mistakes on 'e' and capitals
        await pg.goto(SITE+'/computer-club/typing-test/'); await pg.wait_for_timeout(800)
        await pg.click('button[data-level="silver"]')
        text=await pg.evaluate("Array.from(document.querySelectorAll('#passage span')).map(s=>s.textContent).join('')")
        await pg.click('#typeBox')
        typed=''.join(('x' if (ch=='e' and i%3==0) else ch) for i,ch in enumerate(text[:90]))
        for ch in typed:
            await pg.keyboard.type(ch)
        print('typing clicks (buffers):', await pg.evaluate('__snd.buf'))
        await pg.wait_for_selector('#screenResult:not(.hidden)', timeout=70000); await pg.wait_for_timeout(600)
        print('typing flash:', (await pg.inner_text('.cc-flash')).replace('\n',' | ') if await pg.locator('.cc-flash').count() else 'NONE')
        await pg.click('.cc-flash')
        print('tips:', (await pg.inner_text('#rTips')).replace('\n',' || '))
        await pg.screenshot(path='shots/typing-tips.png', full_page=True)
        # mobile check
        await pg.set_viewport_size({'width':360,'height':760})
        for u in ['/computer-club/','/computer-club/typing-test/','/computer-club/missions/01-shortcut-ninja/']:
            await pg.goto(SITE+u); await pg.wait_for_timeout(900); print(u,'360 sw',await pg.evaluate('document.documentElement.scrollWidth'))
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
