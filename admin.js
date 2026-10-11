'use strict';
// ============================================================
//  FitPulse — режим администратора
//  Вход: 7 быстрых нажатий на логотип FitPulse (или ?admin=1 в адресе).
//  Пока режим включён, результаты НЕ публикуются в онлайн-рейтинг,
//  чтобы тестовые уровни не попадали в общую таблицу.
// ============================================================
(function(){
const F=window.FP;if(!F)return;
const $=id=>document.getElementById(id);
const isAdmin=()=>localStorage.getItem('fp_admin')==='1';
const REW={5:'🦊',10:'aurora',15:'🐺',20:'ember',25:'🦁',30:'gold',35:'🐉',40:'cosmos'};
const PET_AT=[0,40,200,600,1500,4000],PET_E=['🥚','🐣','🐥','🦅','🐉','🔥'];
const totalXP=()=>100*(lvl-1)*lvl/2+xp;

// Блокируем публикацию в облако в режиме админа
const _pub=window.publishToCloud;
window.publishToCloud=async function(silent=true){
  if(isAdmin()){if(!silent)toast('🛠️ Режим админа: публикация в рейтинг отключена');return;}
  return _pub.apply(this,arguments);
};

function refreshAll(){
  save();F.saveP();updateLvlUI();updateDayStreakUI();updatePRList();updateAchUI();renderAvatar();buildThemeGrid();buildEmojiGrid();
  if(F.curTab==='home')F.renderHome();else openTab(F.curTab);
  document.body.classList.toggle('fp-admin',isAdmin());
}
function unlock(id){const P=F.P;if(!P.unlocked.includes(id))P.unlocked.push(id);if(/\p{Extended_Pictographic}/u.test(id)&&!EMOJIS.includes(id))EMOJIS.push(id);}
function completePath(n){
  const P=F.P;P.path={};
  for(let i=0;i<n;i++)P.path[i]=3;
  Object.entries(REW).forEach(([k,v])=>{if(+k<=n)unlock(v);});
}
function setStreak(n){
  dayStreak=n;if(n>maxStreak)maxStreak=n;
  lastWorkoutDate=n>0?localDateKey():null;
  const dates=[];for(let i=0;i<Math.min(n,90);i++){const d=new Date();d.setDate(d.getDate()-i);dates.push(localDateKey(d));}
  localStorage.setItem('fp_workout_dates',JSON.stringify(dates.reverse()));
}

function openAdmin(){
  const P=F.P,pet=window.FPP?.pet();
  const petStage=pet?PET_AT.reduce((a,v,i)=>pet.food>=v?i:a,0):0;
  const ov=F.sheet(`<div class="fpa">
    <div class="fp-ns-head"><div class="fp-ns-ico" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">🛠️</div>
      <div><div class="fp-ns-t">Админ-панель</div><div class="fp-ns-s">Онлайн-рейтинг для этого устройства отключён</div></div></div>

    <button class="fp-cta" data-a="all">👑 Открыть ВСЁ (макс. уровень, все темы, весь Путь)</button>

    <div class="fpa-sec">⚡ Уровень и опыт</div>
    <div class="fpa-row"><span>Уровень</span><input type="number" class="inp" id="fpaLvl" value="${lvl}" min="1" max="999"><button data-a="lvl">OK</button><button data-a="lvlmax">MAX</button></div>
    <div class="fpa-row"><span>Опыт</span><button data-a="xp100">+100</button><button data-a="xp1000">+1000</button><button data-a="xp10000">+10 000</button></div>

    <div class="fpa-sec">🎨 Темы — нажми, чтобы применить</div>
    <div class="fpa-themes">${THEMES.map(t=>`<button data-theme="${t.id}" style="background:linear-gradient(135deg,${t.s1},${t.s2})">${t.name}${t.lock&&!P.unlocked.includes(t.id)?' 🔒':''}</button>`).join('')}</div>
    <div class="fpa-row"><button data-a="themes" style="flex:1">🔓 Открыть все темы и аватары</button></div>

    <div class="fpa-sec">🗺️ Путь героя (пройдено: ${Object.keys(P.path).length}/40)</div>
    <div class="fpa-row"><span>Пройти до этапа</span><input type="number" class="inp" id="fpaPath" value="${Math.max(10,Object.keys(P.path).length)}" min="0" max="40"><button data-a="path">OK</button><button data-a="path0">Сброс</button></div>

    <div class="fpa-sec">🔥 Серия и награды</div>
    <div class="fpa-row"><span>Серия дней</span><input type="number" class="inp" id="fpaStreak" value="${dayStreak}" min="0" max="999"><button data-a="streak">OK</button></div>
    <div class="fpa-row"><span>Щиты: ${P.shields}</span><button data-a="sh3">🛡️ = 3</button><button data-a="gift">🎁 Подарок снова</button></div>
    <div class="fpa-row"><span>Тренировка дня</span><button data-a="wod">Снять отметку</button><button data-a="rings">💫 Закрыть кольца</button></div>

    <div class="fpa-sec">🐣 Питомец</div>
    <div class="fpa-pets">${PET_E.map((e,i)=>`<button data-pet="${i}" class="${i===petStage?'on':''}">${e}</button>`).join('')}</div>

    <div class="fpa-sec">👀 Предпросмотр экранов</div>
    <div class="fpa-row"><button data-a="pv-sum">🏅 Итоги</button><button data-a="pv-lvl">⭐ Level Up</button><button data-a="pv-wrap">📅 Месяц</button></div>
    <div class="fpa-row"><button data-a="pv-onb">👋 Приветствие</button><button data-a="pv-new">✨ Что нового</button></div>

    <div class="fpa-sec">⚠️ Опасная зона</div>
    <div class="fpa-row"><button data-a="off" style="flex:1">Выключить режим админа</button></div>
    <div class="fpa-note">Выдача уровней и наград меняет прогресс только на этом устройстве. Чтобы начать с нуля — «Профиль → Сбросить весь прогресс».</div>
  </div>`,'fp-sheet-admin');

  const num=(id,min,max)=>Math.max(min,Math.min(max,parseInt($(id).value)||min));
  const act={
    all(){lvl=100;xp=0;THEMES.forEach(t=>t.lock&&unlock(t.id));Object.values(REW).forEach(unlock);completePath(40);setStreak(Math.max(dayStreak,30));P.shields=3;
      ACH.forEach(a=>achievements[a.k]=true);if(window.FPP)FPP.pet().food=PET_AT[5];toast('👑 Открыто всё!');confetti(2500);},
    lvl(){lvl=num('fpaLvl',1,999);xp=0;toast(`⚡ Уровень ${lvl}`);},
    lvlmax(){lvl=100;xp=0;toast('⚡ Уровень 100');},
    xp100(){addXP(100);},xp1000(){addXP(1000);},xp10000(){addXP(10000);},
    themes(){THEMES.forEach(t=>t.lock&&unlock(t.id));Object.values(REW).forEach(unlock);toast('🔓 Все темы и аватары открыты');},
    path(){completePath(num('fpaPath',0,40));toast('🗺️ Путь обновлён');},
    path0(){completePath(0);P.unlocked=[];toast('🗺️ Путь сброшен');},
    streak(){setStreak(num('fpaStreak',0,999));toast(`🔥 Серия: ${dayStreak}`);},
    sh3(){P.shields=3;toast('🛡️ 3 щита');},
    gift(){P.gift.last=F.keyOffset(-1);toast('🎁 Подарок снова доступен');},
    wod(){F.day().plan=false;toast('Отметка тренировки дня снята');},
    rings(){const d=F.day();d.reps+=200;d.secs+=40*60;d.xp+=1000;toast('💫 Кольца закрыты');},
    'pv-sum'(){F.closeSheet();setTimeout(()=>F.showSummary({t0:Date.now()-372000,xp0:totalXP()-240,vol0:totalVolume-42,cal0:caloriesBurned-23,pr0:{...prRecords},per:{pushup:18,squat:24},plank:0},null),300);return true;},
    'pv-lvl'(){F.closeSheet();showLevelUpScreen(lvl);return true;},
    'pv-wrap'(){F.closeSheet();if(window.FPP)FPP.openWrapped();return true;},
    'pv-onb'(){F.closeSheet();$('onboardOv')?.classList.add('visible');return true;},
    'pv-new'(){F.closeSheet();openChangelog();return true;},
    off(){localStorage.removeItem('fp_admin');toast('Режим админа выключен');F.closeSheet();refreshAll();return true;},
  };
  ov.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const stop=act[b.dataset.a]();refreshAll();if(!stop)setTimeout(openAdmin,260);});
  ov.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{unlock(b.dataset.theme);setTheme(b.dataset.theme);refreshAll();toast('🎨 Тема применена');});
  ov.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>{if(window.FPP){FPP.pet().food=PET_AT[+b.dataset.pet];FPP.pet().last=Date.now();}refreshAll();setTimeout(openAdmin,260);});
}

function enable(){
  if(!isAdmin()){
    if(!confirm('Включить режим администратора?\n\nМожно выдать любой уровень, открыть все темы и награды. Пока режим включён, результаты с этого устройства не попадают в онлайн-рейтинг.'))return;
    localStorage.setItem('fp_admin','1');document.body.classList.add('fp-admin');toast('🛠️ Режим админа включён');
  }
  openAdmin();
}
document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.toggle('fp-admin',isAdmin());
  // 7 быстрых нажатий на логотип
  let taps=0,tt=null;
  document.querySelector('.app-header .logo')?.addEventListener('click',()=>{
    taps++;clearTimeout(tt);tt=setTimeout(()=>taps=0,1500);
    if(taps>=7){taps=0;enable();}
  });
  // Пункт в меню (виден только админу)
  const hub=document.querySelector('#menuHubModal .modal-body');
  if(hub){const b=document.createElement('button');b.className='m-btn ghost menu-hub-item fpa-hub';b.innerHTML='🛠️ Админ-панель <span class="menu-hub-sub">Уровни, темы, награды</span>';b.onclick=()=>{closeModal('menuHubModal');openAdmin();};hub.appendChild(b);}
  if(new URLSearchParams(location.search).get('admin')==='1')setTimeout(enable,600);
});
window.FPA={open:openAdmin,enable};
})();
