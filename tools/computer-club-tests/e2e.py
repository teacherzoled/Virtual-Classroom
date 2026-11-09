import asyncio, json, urllib.request, re
from playwright.async_api import async_playwright
import os; CHROME=os.environ.get('CHROME','/usr/bin/google-chrome'); os.makedirs('shots', exist_ok=True)
SITE='http://localhost:5500'; PROD='https://computer-club-records.smartstandardsix.workers.dev'
OFFLINE={'on':False}
def sheet(): return json.loads(urllib.request.urlopen('http://localhost:8787/__sheet').read())
async def route(r):
    if OFFLINE['on']: return await r.abort()
    req=r.request; path=req.url[len(PROD):]
    data=req.post_data_buffer
    rq=urllib.request.Request('http://localhost:8787'+path, data=data, method=req.method, headers={'Origin':SITE,'Content-Type':'text/plain'})
    try: resp=urllib.request.urlopen(rq); body=resp.read(); st=resp.status; hd=dict(resp.headers)
    except urllib.error.HTTPError as e: body=e.read(); st=e.code; hd=dict(e.headers)
    await r.fulfill(status=st, headers=hd, body=body)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(viewport={'width':1280,'height':900})
        await ctx.route(PROD+'/**', route)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:'+m.text) if m.type=='error' and 'fonts' not in m.text and 'postimg' not in m.text else None)
        # 1 homepage
        await pg.goto(SITE+'/'); 
        assert await pg.locator('a.grade-card[href="/computer-club/"]').count()==1
        await pg.screenshot(path='shots/home.png', full_page=True)
        # 2 hub signed out
        await pg.goto(SITE+'/computer-club/')
        print('chip:', await pg.inner_text('#status'))
        print('tc href signed-out:', await pg.get_attribute('#tcLink','href'))
        assert await pg.is_visible('#signedOutBoard')
        # 3 teacher
        await pg.goto(SITE+'/computer-club/teacher/')
        await pg.fill('#codeInput','nope'); await pg.click('#openBtn'); await pg.wait_for_timeout(400)
        print('teacher wrong:', await pg.inner_text('#lockMsg'))
        await pg.fill('#codeInput','TEACH42'); await pg.click('#openBtn'); await pg.wait_for_selector('#dash:not(.hidden)')
        await pg.fill('#newCode','byte7'); await pg.fill('#newWeek','1'); await pg.select_option('#newMission','Shortcut Ninja')
        await pg.click('#saveSessionBtn'); await pg.wait_for_timeout(600)
        print('session:', await pg.inner_text('#sessionMsg'), '| code now', await pg.inner_text('#codeNow'))
        await pg.wait_for_timeout(800)
        await pg.click('#missionSwitches .switch'); await pg.wait_for_timeout(600)
        # 4 sign in
        await pg.goto(SITE+'/computer-club/sign-in/?next=/computer-club/')
        await pg.fill('#codeInput','club1'); await pg.click('#codeBtn'); await pg.wait_for_timeout(400)
        print('old code:', await pg.inner_text('#codeMsg'))
        await pg.fill('#codeInput','byte7'); await pg.click('#codeBtn'); await pg.wait_for_selector('#stepName:not(.hidden)')
        print('names:', await pg.inner_text('#nameList'))
        await pg.screenshot(path='shots/signin-names.png', full_page=True)
        await pg.click('.name-btn:has-text("Ana R.")')
        for k in '9999': await pg.click(f'#keypad .key:text-is("{k}")')
        await pg.wait_for_timeout(400); print('wrong pin:', await pg.inner_text('#pinMsg'))
        await pg.screenshot(path='shots/signin-pin.png', full_page=True)
        await pg.keyboard.type('1234'); await pg.wait_for_url(SITE+'/computer-club/', timeout=5000)
        print('attendance rows:', sheet()['Attendance'][1:])
        # 5 hub signed in
        await pg.wait_for_timeout(800)
        print('chip:', await pg.inner_text('#status'))
        print('tc href signed-in:', await pg.get_attribute('#tcLink','href'))
        print('bests:', await pg.inner_text('#myBests'))
        await pg.screenshot(path='shots/hub-signedin.png', full_page=True)
        # 7 ninja bronze
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/')
        codes={"COPY":"c","PASTE":"v","CUT":"x","UNDO":"z","SELECT ALL":"a","SAVE":"s","FIND A WORD":"f","BOLD":"b","ITALIC":"i","REDO":"y"}
        await pg.click('button[data-level="bronze"]')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(700)
        print('ninja save:', await pg.inner_text('#saveLine'), '| toast:', await pg.locator('.cc-toast').all_inner_texts())
        await pg.screenshot(path='shots/ninja-result.png')
        # 8 offline then recover
        OFFLINE['on']=True
        await pg.click('#againBtn')
        for i in range(10):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(700)
        print('offline save:', await pg.inner_text('#saveLine'), '| chip:', await pg.inner_text('#status'))
        n_before=len(sheet()['Mission Results'])
        OFFLINE['on']=False
        await pg.reload(); await pg.wait_for_timeout(2500)
        n_after=len(sheet()['Mission Results'])
        print('results rows before/after recover:', n_before, n_after, '| chip:', await pg.inner_text('#status'))
        await pg.reload(); await pg.wait_for_timeout(2500)
        print('after 2nd reload rows:', len(sheet()['Mission Results']))
        # gold quick: 3 correct then wait for timer
        await pg.click('button[data-level="gold"]')
        for i in range(13):
            a=await pg.text_content('#action'); await pg.keyboard.press('Control+'+codes[a])
        await pg.wait_for_timeout(61500)
        print('gold:', await pg.inner_text('#resultText'), '|', await pg.inner_text('#saveLine'))
        # 6 typing test (bronze): type 120 chars with 3 mistakes, then wait for the clock
        await pg.goto(SITE+'/computer-club/typing-test/')
        await pg.click('button[data-level="bronze"]')
        text=await pg.evaluate("Array.from(document.querySelectorAll('#passage span')).map(s=>s.textContent).join('')")
        await pg.click('#typeBox')
        seg=text[:120]
        await pg.keyboard.type(seg[:50]); await pg.keyboard.type('qqq'); 
        for _ in range(3): await pg.keyboard.press('Backspace')
        await pg.keyboard.type(seg[50:])
        print('live:', await pg.inner_text('#sAcc'))
        await pg.screenshot(path='shots/typing-live.png')
        await pg.wait_for_selector('#screenResult:not(.hidden)', timeout=70000)
        await pg.wait_for_timeout(800)
        print('typing result:', await pg.inner_text('#rWpm'), await pg.inner_text('#rAcc'), await pg.inner_text('#rErr'), '|', await pg.inner_text('#rSave'))
        await pg.screenshot(path='shots/typing-result.png')
        print('typing rows:', sheet()['Typing'][1:])
        # paste blocked
        await pg.click('#againBtn'); await pg.evaluate("navigator.clipboard && 0")
        # 10 second student
        await pg.goto(SITE+'/computer-club/sign-in/')
        await pg.click('#switchBtn'); await pg.fill('#codeInput','BYTE7'); await pg.click('#codeBtn')
        await pg.click('.name-btn:has-text("Ben T.")'); await pg.keyboard.type('0042'); await pg.wait_for_url(SITE+'/computer-club/')
        await pg.wait_for_timeout(1500)
        print('ben chip:', await pg.inner_text('#status'))
        print('leaderboard typing:', await pg.inner_text('#boardFastest'), '| ninja:', await pg.inner_text('#boardNinja'))
        # 9 teacher dashboard
        await pg.goto(SITE+'/computer-club/teacher/'); await pg.wait_for_selector('#dash:not(.hidden)')
        print('tiles:', (await pg.inner_text('#tiles')).replace('\n',' '))
        print('att:', (await pg.inner_text('#attTable')).replace('\n',' | ')[:300])
        print('typ:', (await pg.inner_text('#typTable')).replace('\n',' | ')[:300])
        print('badges:', (await pg.inner_text('#badgeTable')).replace('\n',' | ')[:300])
        await pg.screenshot(path='shots/teacher.png', full_page=True)
        await pg.click('#projectBtn'); await pg.screenshot(path='shots/projector.png'); await pg.click('#projector')
        print('Badges sheet:', [r[3] for r in sheet()['Badges'][1:]])
        # 11 layout
        for w in (360,1280):
            await pg.set_viewport_size({'width':w,'height':800})
            for u,n in [('/','home'),('/computer-club/','hub'),('/computer-club/sign-in/','signin'),('/computer-club/typing-test/','typing'),('/computer-club/missions/01-shortcut-ninja/','ninja'),('/computer-club/teacher/','teacher')]:
                await pg.goto(SITE+u); await pg.wait_for_timeout(900)
                sw=await pg.evaluate('document.documentElement.scrollWidth'); bw=await pg.evaluate('document.body.scrollWidth')
                if w==360: await pg.screenshot(path=f'shots/{n}-360.png', full_page=True)
                print(n,w,'scrollWidth',sw,bw)
        # light theme
        await pg.set_viewport_size({'width':1280,'height':900})
        await pg.goto(SITE+'/computer-club/'); await pg.click('.theme-btn:has-text("Sunny")'); await pg.wait_for_timeout(600)
        await pg.screenshot(path='shots/hub-sunny.png', full_page=True)
        await pg.goto(SITE+'/computer-club/missions/01-shortcut-ninja/'); await pg.wait_for_timeout(600)
        await pg.screenshot(path='shots/ninja-sunny.png', full_page=True)
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
