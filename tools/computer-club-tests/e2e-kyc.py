# Week 2 · Know Your Computer (Nov 9): pictures load, Bronze round with one miss (hint glow) saves 3 stars + Hardware Hero,
# Gold round saves the score and "Your Gold best", Desk Hunt message, no sideways scroll at 360 px.
import asyncio, os, re
from playwright.async_api import async_playwright
CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
HERE=os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, 'e2e.py')).read().split('async def main')[0])
SRC=open(os.path.join(HERE, '../../computer-club/missions/02-know-your-computer/index.html'), encoding='utf-8').read()
CLUE={}
for m in re.finditer(r"\{ id: '([a-z-]+)', name:[\s\S]*?clues: \['(.*?)', '(.*?)'\] \}", SRC):
    CLUE['"'+m.group(2)+'"']=m.group(1); CLUE['"'+m.group(3)+'"']=m.group(1)
assert len(CLUE)==24, len(CLUE)
PAGE=SITE+'/computer-club/missions/02-know-your-computer/'
async def answer_right(pg):
    c=await pg.inner_text('#clue'); await pg.click('#answers .ans[data-part="%s"]' % CLUE[c])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        # teacher: start a Week 2 session and switch Week 2 on
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.fill('#newCode','PARTS2'); await pg.fill('#newWeek','2'); await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(800)
        row2='#missionSwitches .switch-row:nth-child(2)'
        assert 'Know Your Computer' in await pg.inner_text(row2)
        assert not await pg.eval_on_selector(row2+' .switch', 'b=>b.disabled'), 'Week 2 is built: switch works'
        await pg.click(row2+' .switch'); await pg.wait_for_timeout(600)
        assert await pg.eval_on_selector(row2+' .switch', "b=>b.getAttribute('aria-checked')")=='true'
        # hub: Week 2 card is a live link
        await pg.goto(SITE+'/computer-club/'); await pg.wait_for_timeout(1200)
        assert await pg.evaluate("(()=>{const c=document.querySelector('.card.mission[data-week=\"2\"]');return c.tagName==='A'&&!c.classList.contains('soon')&&!c.classList.contains('locked')})()"), 'week 2 card open'
        # sign in
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','PARTS2'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Ana R.")'); await pg.keyboard.type('1234'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.goto(PAGE); await pg.wait_for_timeout(1500)
        assert await pg.is_hidden('#missionLocked'), 'mission open'
        cards=await pg.eval_on_selector_all('.part-card', 'cs=>cs.length'); hunt=await pg.eval_on_selector_all('#hunt li', 'ls=>ls.length')
        imgs=await pg.eval_on_selector_all('img[src*="c02-"]', 'is=>[is.length, is.filter(i=>i.complete&&i.naturalWidth>0).length]')
        print('cards', cards, 'hunt', hunt, 'imgs', imgs); assert cards==12 and hunt==9 and imgs[0]==imgs[1]==21
        await pg.screenshot(path='shots/kyc-learn.png', full_page=True)
        # Bronze: one miss first (hint glows on the right card), then all right → 1 miss = 3 stars
        await pg.click('button[data-level="bronze"]'); await pg.wait_for_timeout(300)
        assert await pg.eval_on_selector_all('#answers .ans', 'a=>a.length')==6
        right=CLUE[await pg.inner_text('#clue')]
        wrong=await pg.eval_on_selector_all('#answers .ans', 'as=>as.map(a=>a.dataset.part)'); wrong=[w for w in wrong if w!=right][0]
        await pg.click('#answers .ans[data-part="%s"]' % wrong)
        glow=await pg.eval_on_selector_all('#answers .ans.glow', 'as=>as.map(a=>a.dataset.part)'); print('glow', glow); assert glow==[right]
        await pg.screenshot(path='shots/kyc-bronze-hint.png')
        for i in range(6): await answer_right(pg)
        await pg.wait_for_timeout(1200)
        print('bronze:', await pg.inner_text('#resultStars'), await pg.inner_text('#rank'), '|', await pg.inner_text('#saveLine'))
        assert await pg.inner_text('#resultStars')=='★★★' and 'Saved' in await pg.inner_text('#saveLine')
        await pg.screenshot(path='shots/kyc-bronze-result.png')
        sh=sheet(); r=[x for x in sh['Mission Results'][1:] if x[6]=='know-your-computer']
        print('row', r[-1][6:13]); assert r[-1][8]=='bronze' and r[-1][9]==6 and r[-1][11]==3 and r[-1][12]==1
        assert any(x[3]=='know-your-computer' and x[4]=='Hardware Hero' for x in sh['Badges'][1:]), 'badge'
        # Silver: 12 answer cards
        await pg.click('#menuBtn'); await pg.click('button[data-level="silver"]'); await pg.wait_for_timeout(300)
        assert await pg.eval_on_selector_all('#answers .ans', 'a=>a.length')==12
        await pg.screenshot(path='shots/kyc-silver.png')
        await pg.click('#quitBtn')
        # Gold: 11 right, then the 60 s run out → 2 stars, score 11, best note
        await pg.click('button[data-level="gold"]'); await pg.wait_for_timeout(300)
        for i in range(11): await answer_right(pg)
        await pg.wait_for_selector('#screenResult:not(.hidden)', timeout=70000); await pg.wait_for_timeout(1500)
        print('gold:', await pg.inner_text('#resultStars'), await pg.inner_text('#rank'), '|', await pg.inner_text('#resultText'))
        assert await pg.inner_text('#resultStars')=='★★☆'
        r=[x for x in sheet()['Mission Results'][1:] if x[6]=='know-your-computer' and x[8]=='gold']; assert r and r[-1][9]==11 and r[-1][11]==2
        await pg.goto(PAGE); await pg.wait_for_timeout(1500)
        print('best note:', await pg.inner_text('#bestNote')); assert '11' in await pg.inner_text('#bestNote')
        # Desk Hunt: 8 found + 1 not at my desk
        lis=await pg.query_selector_all('#hunt li')
        for i,li in enumerate(lis): await (await li.query_selector('.none-btn' if i==5 else '.found-btn')).click()
        msg=await pg.inner_text('#huntMsg'); print('hunt:', msg); assert 'You found 8 of 9' in msg
        await pg.screenshot(path='shots/kyc-hunt.png', full_page=True)
        # phone width
        for theme in ['sunny']:
            await pg.evaluate("setTheme('%s')" % theme)
        await pg.set_viewport_size({'width':360,'height':800}); await pg.wait_for_timeout(400)
        await pg.click('button[data-level="silver"]'); await pg.wait_for_timeout(400)
        sw=await pg.evaluate('document.documentElement.scrollWidth'); print('scrollWidth at 360:', sw); assert sw<=360
        await pg.wait_for_timeout(900)
        gap=await pg.evaluate("document.getElementById('hudLeft').getBoundingClientRect().top - document.querySelector('.cc-xp').getBoundingClientRect().bottom")
        print('HUD below the XP bar by', gap, 'px'); assert gap>0, 'clue counter hidden under the XP bar'
        await pg.screenshot(path='shots/kyc-phone.png', full_page=True)
        print('ERRORS:', errs); assert not errs
        await b.close()
asyncio.run(main())
