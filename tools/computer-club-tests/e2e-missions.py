# Nov 9: all 10 Cadet missions in the backend. Dashboard shows 10 switches, unbuilt ones greyed out
# with "Not built yet"; the hub badge shelf shows all 13 badges (10 missions + 3 typing).
import asyncio, os
from playwright.async_api import async_playwright
CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'e2e.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900}); await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn')
        await pg.wait_for_selector('#dash:not(.hidden)'); await pg.wait_for_timeout(500)
        rows=await pg.eval_on_selector_all('#missionSwitches .switch-row', "rs=>rs.map(r=>[r.querySelector('.sw-name').textContent, r.querySelector('.switch').disabled, r.innerText.includes('Not built yet')])")
        print('rows:', rows)
        assert len(rows)==10, len(rows)
        assert rows[0]==['Week 1 · Shortcut Ninja', False, False], rows[0]
        assert rows[1]==['Week 2 · Know Your Computer', False, False], rows[1]   # built Nov 9
        assert rows[9][0]=='Week 10 · Typing Olympics'
        assert all(r[1] and r[2] for r in rows[2:]), 'weeks 3-10 greyed out + labelled'
        await pg.click('#missionSwitches .switch-row:nth-child(3) .switch', force=True); await pg.wait_for_timeout(500)
        assert await pg.eval_on_selector('#missionSwitches .switch-row:nth-child(3) .switch', "b=>b.getAttribute('aria-checked')")=='false', 'unbuilt switch cannot be turned on'
        await pg.click('#missionSwitches .switch'); await pg.wait_for_timeout(600)   # Shortcut Ninja still switches
        assert await pg.eval_on_selector('#missionSwitches .switch', "b=>b.getAttribute('aria-checked')")=='true'
        await pg.click('#clubSwitch'); await pg.wait_for_timeout(600)
        heads=await pg.eval_on_selector_all('#badgeTable th.badge-head', "hs=>hs.length")
        print('badge table columns:', heads); assert heads==13, heads
        await pg.screenshot(path='shots/teacher-missions.png', clip={'x':0,'y':380,'width':1280,'height':760})
        # student hub: 13 badges on the shelf, Week 2 card still "coming soon"
        await pg.goto(SITE+'/computer-club/sign-in/'); await pg.fill('#codeInput','CLUB1'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Ana R.")'); await pg.keyboard.type('1234'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.wait_for_timeout(1500)
        shelf=await pg.eval_on_selector_all('#myBadges .badge-item', "bs=>bs.map(b=>b.textContent.trim())")
        print('shelf:', shelf); assert len(shelf)==13 and 'Hardware Hero' in shelf and 'Typing Olympian' in shelf
        imgs=await pg.eval_on_selector_all('#myBadges .badge-item img', "is=>is.filter(i=>i.complete&&i.naturalWidth>0).length")
        print('badge pictures loaded:', imgs); assert imgs==13, imgs
        assert await pg.evaluate("document.querySelector('.card.mission[data-week=\"3\"]').classList.contains('soon')")
        await pg.screenshot(path='shots/hub-badges.png', full_page=True)
        print('ERRORS:', errs); assert not errs
        await b.close()
asyncio.run(main())
