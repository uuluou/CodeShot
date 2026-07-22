(function(){
'use strict';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced) document.documentElement.setAttribute('data-reduced','true');

const sunSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const moonSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>';
const uiModeBtn = document.getElementById('ui-mode-btn');
let uiMode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
function applyUIMode(mode){
  document.documentElement.setAttribute('data-ui', mode);
  uiModeBtn.setAttribute('aria-pressed', mode==='light');
  uiModeBtn.innerHTML = mode==='light' ? moonSVG : sunSVG;
}
function toggleUIMode(){ uiMode = uiMode==='light' ? 'dark' : 'light'; applyUIMode(uiMode); }
applyUIMode(uiMode);
uiModeBtn.addEventListener('click', toggleUIMode);

const dot=document.getElementById('cursor-dot'), ring=document.getElementById('cursor-ring'), glow=document.getElementById('glow');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
window.addEventListener('pointermove',e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+'px'; dot.style.top=my+'px';
  glow.style.setProperty('--mx',mx+'px'); glow.style.setProperty('--my',my+'px');
  const t=e.target;
  if(t.closest && t.closest('button,a,select,input,.tilt-card')) ring.classList.add('active'); else ring.classList.remove('active');
});
(function loop(){ rx+=(mx-rx)*.18; ry+=(my-ry)*.18; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();

const cv=document.getElementById('airflow'), ctx=cv.getContext('2d');
function resize(){ cv.width=innerWidth; cv.height=innerHeight; }
resize(); window.addEventListener('resize',resize);
const N=reduced?0:36;
const lines=Array.from({length:N},()=>({
  x:Math.random()*innerWidth, y:Math.random()*innerHeight,
  len:40+Math.random()*90, speed:.4+Math.random()*.9, op:.03+Math.random()*.07
}));
function drawAirflow(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.strokeStyle='rgba(200,204,212,1)';
  lines.forEach(l=>{
    ctx.globalAlpha=l.op;
    ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x-l.len*.6,l.y-l.len);
    ctx.lineWidth=1; ctx.stroke();
    l.x+=l.speed*.6; l.y+=l.speed;
    if(l.y-l.len>innerHeight || l.x>innerWidth+l.len){ l.x=-20+Math.random()*innerWidth*.4; l.y=-40; }
  });
  requestAnimationFrame(drawAirflow);
}
drawAirflow();

const LANGS = {
  ts:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('const let var function return if else for while class extends new import export default from async await try catch finally switch case break continue typeof instanceof in of this super static get set yield null undefined true false void delete throw do interface type implements readonly enum public private protected'.split(' '))},
  js:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('const let var function return if else for while class extends new import export default from async await try catch finally switch case break continue typeof instanceof in of this super static get set yield null undefined true false void delete throw do'.split(' '))},
  python:{lineComment:'#', triple:['"""',"'''"], keywords:new Set('def return if elif else for while in import from as class try except finally with lambda pass break continue global nonlocal yield async await not and or is None True False raise del assert'.split(' '))},
  css:{blockComment:['/*','*/'], keywords:new Set()},
  html:{blockComment:['<!--','-->'], keywords:new Set()},
  json:{keywords:new Set(['true','false','null'])},
  go:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('package import func return if else for range var const type struct interface map chan go defer select switch case break continue default nil true false iota'.split(' '))},
  rust:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('fn let mut return if else for while loop match struct enum impl trait pub use mod crate self Self true false None Some Ok Err as ref move async await unsafe static const'.split(' '))},
  bash:{lineComment:'#', keywords:new Set('if then else fi for while do done function echo export local return case esac in'.split(' '))},
  c:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('int float double char void return if else for while switch case break continue struct typedef union enum static const sizeof include define long short unsigned signed'.split(' '))},
  cpp:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('int float double char void return if else for while switch case break continue class struct public private protected new delete template namespace using virtual override try catch throw static const auto true false nullptr'.split(' '))},
  java:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('public private protected class interface extends implements static final void int double float boolean char long short byte return if else for while switch case break continue new try catch finally throw throws import package this super null true false'.split(' '))},
  csharp:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('public private protected class interface static void int double float bool char long short byte string var return if else for while switch case break continue new try catch finally throw import using namespace this base null true false async await'.split(' '))},
  php:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('function return if else elseif foreach for while switch case break continue class public private protected static new echo print true false null array use namespace require include extends implements'.split(' '))},
  ruby:{lineComment:'#', keywords:new Set('def end return if elsif else unless while until for in class module require attr_accessor true false nil self do begin rescue ensure yield'.split(' '))},
  swift:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('func return if else guard for while switch case break continue class struct enum protocol extension import var let true false nil self init deinit private public static'.split(' '))},
  kotlin:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('fun return if else for while when class object interface val var true false null this import package private public override companion'.split(' '))},
  sql:{lineComment:'--', keywords:new Set('SELECT FROM WHERE INSERT INTO UPDATE DELETE CREATE TABLE ALTER DROP JOIN LEFT RIGHT INNER OUTER ON GROUP BY ORDER HAVING AS AND OR NOT NULL VALUES SET LIMIT DISTINCT'.split(' '))},
  yaml:{lineComment:'#', keywords:new Set(['true','false','null'])},
  markdown:{keywords:new Set()},
  xml:{blockComment:['<!--','-->'], keywords:new Set()},
  scss:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set()},
  less:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set()},
  lua:{lineComment:'--', blockComment:['--[[',']]'], keywords:new Set('function end return if then else elseif for while do local true false nil and or not'.split(' '))},
  perl:{lineComment:'#', keywords:new Set('my sub return if elsif else unless while until for foreach use package require our local print true false undef'.split(' '))},
  dart:{lineComment:'//', blockComment:['/*','*/'], keywords:new Set('void main class extends implements return if else for while switch case break continue import var final const true false null async await'.split(' '))},
  graphql:{lineComment:'#', keywords:new Set('query mutation subscription type input enum interface union scalar fragment on true false null'.split(' '))},
  dockerfile:{lineComment:'#', keywords:new Set('FROM RUN CMD LABEL MAINTAINER EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL'.split(' '))},
  powershell:{lineComment:'#', keywords:new Set('function param if elseif else foreach while do return true false null'.split(' '))},
  plaintext:{keywords:new Set()}
};
function tokenize(code, cfg){
  let i=0, n=code.length, tokens=[];
  while(i<n){
    const rest=code.slice(i);
    let m;
    if(m=/^[ \t]+/.exec(rest)){ tokens.push({t:m[0],c:''}); i+=m[0].length; continue; }
    if(rest[0]==='\n'){ tokens.push({t:'\n',c:''}); i+=1; continue; }
    if(cfg.blockComment && rest.startsWith(cfg.blockComment[0])){
      let end=code.indexOf(cfg.blockComment[1], i+cfg.blockComment[0].length);
      end = end===-1? n : end+cfg.blockComment[1].length;
      tokens.push({t:code.slice(i,end),c:'cm'}); i=end; continue;
    }
    if(cfg.lineComment && rest.startsWith(cfg.lineComment)){
      let end=code.indexOf('\n',i); if(end===-1) end=n;
      tokens.push({t:code.slice(i,end),c:'cm'}); i=end; continue;
    }
    let triple=false;
    if(cfg.triple){
      for(const tq of cfg.triple){
        if(rest.startsWith(tq)){
          let end=code.indexOf(tq, i+tq.length); end = end===-1? n : end+tq.length;
          tokens.push({t:code.slice(i,end),c:'st'}); i=end; triple=true; break;
        }
      }
    }
    if(triple) continue;
    if(m=/^(['"`])(?:\\.|(?!\1)[^\\\n])*\1?/.exec(rest)){ tokens.push({t:m[0],c:'st'}); i+=m[0].length; continue; }
    if(m=/^\d+\.?\d*([eE][+-]?\d+)?/.exec(rest)){ tokens.push({t:m[0],c:'nu'}); i+=m[0].length; continue; }
    if(m=/^[A-Za-z_$][A-Za-z0-9_$-]*/.exec(rest)){
      const w=m[0]; let cls='id';
      if(cfg.keywords.has(w)) cls='kw';
      else if(/^\s*\(/.test(code.slice(i+w.length))) cls='fn';
      tokens.push({t:w,c:cls}); i+=w.length; continue;
    }
    tokens.push({t:rest[0],c:'pu'}); i+=1;
  }
  return tokens;
}
function escapeHTML(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function highlightToHTML(code, lang){
  const cfg = LANGS[lang] || LANGS.plaintext;
  const toks = tokenize(code, cfg);
  return toks.map(t=> t.c? `<span class="tok-${t.c}">${escapeHTML(t.t)}</span>` : escapeHTML(t.t)).join('');
}

const THEMES = {
  obsidian:{ name:'Obsidian', mode:'dark', bg:'#111214', text:'#e4e6eb', kw:'#d4af37', st:'#8ea9c1', cm:'#5b6068', fn:'#e8c766', nu:'#a7b0bd', pu:'#7a7f87' },
  nordwing:{ name:'Nordwing', mode:'dark', bg:'#0d1218', text:'#d7dee6', kw:'#7dd3fc', st:'#93c5fd', cm:'#4b5563', fn:'#67e8f9', nu:'#f2b84b', pu:'#5b6572' },
  titanium:{ name:'Titanium', mode:'dark', bg:'#141414', text:'#d4d4d4', kw:'#f5f5f5', st:'#9a9a9a', cm:'#5a5a5a', fn:'#d4af37', nu:'#bdbdbd', pu:'#6c6c6c' },
  solstice:{ name:'Solstice', mode:'light', bg:'#faf9f6', text:'#1a1a1a', kw:'#8a5a00', st:'#3a5a6b', cm:'#8a8578', fn:'#5a3d00', nu:'#4a4a4a', pu:'#8a857c' },
  slatehawk:{ name:'Slate Hawk', mode:'dark', bg:'#12151a', text:'#d6dae2', kw:'#8fb7ff', st:'#9fd6c9', cm:'#545b66', fn:'#c9d6ff', nu:'#b7c2d0', pu:'#5c636e' },
  carbonfiber:{ name:'Carbon Fiber', mode:'dark', bg:'#0e0e0f', text:'#d8d8d8', kw:'#bfa15a', st:'#7f8a90', cm:'#4c4c4c', fn:'#d8c08a', nu:'#a8a8a8', pu:'#5c5c5c' },
  midnightfalcon:{ name:'Midnight Falcon', mode:'dark', bg:'#0a0d16', text:'#dce2f0', kw:'#6f8bff', st:'#7fd0e0', cm:'#4a5170', fn:'#9db2ff', nu:'#b0b8d0', pu:'#545c78' },
  graphite:{ name:'Graphite', mode:'dark', bg:'#1a1a1c', text:'#d0d0d0', kw:'#e8e8e8', st:'#8f8f8f', cm:'#5a5a5a', fn:'#c9a83e', nu:'#adadad', pu:'#6a6a6a' },
  embernoir:{ name:'Ember Noir', mode:'dark', bg:'#14100b', text:'#ecdfc9', kw:'#e0a13c', st:'#c98a5a', cm:'#6b5a45', fn:'#f0c264', nu:'#d4b98f', pu:'#8a7458' },
  deepfjord:{ name:'Deep Fjord', mode:'dark', bg:'#0b1414', text:'#cfe3e0', kw:'#57c7b8', st:'#6fa8a3', cm:'#4a5f5c', fn:'#7fe0cf', nu:'#a6c4c0', pu:'#4f6663' },
  onyxcircuit:{ name:'Onyx Circuit', mode:'dark', bg:'#0c0f0d', text:'#cfe0d2', kw:'#4fd67a', st:'#6f9c7c', cm:'#4b5750', fn:'#7be89a', nu:'#a9c2ae', pu:'#526056' },
  ashwing:{ name:'Ashwing', mode:'dark', bg:'#131218', text:'#d8d5e0', kw:'#a996d6', st:'#8c93c4', cm:'#565269', fn:'#c3b3ea', nu:'#b3aecf', pu:'#625d78' },
  ravenlock:{ name:'Ravenlock', mode:'dark', bg:'#070708', text:'#e8e8e8', kw:'#ffffff', st:'#9a9a9a', cm:'#4a4a4a', fn:'#cfa740', nu:'#b0b0b0', pu:'#5a5a5a' },
  duskline:{ name:'Duskline', mode:'dark', bg:'#16110f', text:'#e6d9d2', kw:'#d68a6b', st:'#b98f7a', cm:'#6b5850', fn:'#e8ab7f', nu:'#cbb3a8', pu:'#7d6a62' },
  inkfeather:{ name:'Ink Feather', mode:'dark', bg:'#0d0e1a', text:'#d9dcf0', kw:'#8a9bff', st:'#7a8fd0', cm:'#4b4f6e', fn:'#aebcff', nu:'#b3b8d8', pu:'#565a76' },
  ivorytalon:{ name:'Ivory Talon', mode:'light', bg:'#f7f4ee', text:'#23201b', kw:'#8a5a00', st:'#3a6b6b', cm:'#948a78', fn:'#6b4600', nu:'#57534a', pu:'#948a80' },
  chalkline:{ name:'Chalkline', mode:'light', bg:'#f2f2f0', text:'#202020', kw:'#444444', st:'#5c5c5c', cm:'#9a9a9a', fn:'#b8862e', nu:'#6a6a6a', pu:'#9a9a9a' },
  paperwing:{ name:'Paperwing', mode:'light', bg:'#faf6ef', text:'#26221c', kw:'#b1631f', st:'#4c6b73', cm:'#a89c88', fn:'#8a4a12', nu:'#6a6258', pu:'#a89c88' },
  frostwing:{ name:'Frost Wing', mode:'light', bg:'#eef2f6', text:'#1c2530', kw:'#2f6fb0', st:'#3d7a6b', cm:'#8a94a0', fn:'#1d5a94', nu:'#5c6773', pu:'#8a94a0' },
  linen:{ name:'Linen', mode:'light', bg:'#f5f0e8', text:'#241f19', kw:'#8a6b3a', st:'#55705f', cm:'#9c8f7a', fn:'#6b5127', nu:'#665c4e', pu:'#9c8f7a' }
};
const BGSTYLES = {
  'grad-obsidian':'radial-gradient(circle at 30% 20%, #1c1e22, #0a0a0b 70%)',
  'grad-gold':'radial-gradient(circle at 70% 20%, #2a2313, #0d0d0e 70%)',
  'solid':'#141518',
  'transparent':'transparent'
};

const EXT = {
  ts:'ts',js:'js',python:'py',css:'css',html:'html',json:'json',go:'go',rust:'rs',bash:'sh',plaintext:'txt',
  c:'c',cpp:'cpp',java:'java',csharp:'cs',php:'php',ruby:'rb',swift:'swift',kotlin:'kt',sql:'sql',yaml:'yml',
  markdown:'md',xml:'xml',scss:'scss',less:'less',lua:'lua',perl:'pl',dart:'dart',graphql:'graphql',
  dockerfile:'',powershell:'ps1'
};
const SAMPLES = {
  ts:`export function intercept<T>(flock: T[], target: (x: T) => boolean): T | null {
  for (const bird of flock) {
    if (target(bird)) return bird;
  }
  return null;
}

const shot = { name: "CodeShot", format: "png", precise: true };`,
  js:`function glide(altitude, wind) {
  const drag = wind * 0.12;
  return altitude - drag;
}

console.log(glide(1200, 4));`,
  python:`def stoop(altitude, mass=0.7):
    g = 9.81
    velocity = (2 * g * altitude) ** 0.5
    return velocity * mass

print(stoop(300))`,
  css:`.wing {
  clip-path: polygon(0 0, 100% 40%, 0 100%);
  background: linear-gradient(135deg, #cfa740, #0d0f12);
  transition: transform .4s cubic-bezier(.16,.84,.32,1);
}`,
  html:`<article class="card">
  <h1>CodeShot</h1>
  <p>Silent. Precise. Fast.</p>
</article>`,
  json:`{
  "name": "CodeShot",
  "topSpeed": 389,
  "silent": true,
  "themes": ["Obsidian", "Nordwing", "Titanium", "Solstice"]
}`,
  go:`package main

func Stoop(altitude float64) float64 {
	g := 9.81
	return altitude * g
}`,
  rust:`fn stoop(altitude: f64) -> f64 {
    let g = 9.81;
    altitude * g
}`,
  bash:`#!/bin/bash
echo "launching codeshot build"
export NODE_ENV=production
npm run build`,
  plaintext:`CodeShot
Silent. Precise. Fast.`,
  c:`#include <stdio.h>

float stoop(float altitude) {
    float g = 9.81f;
    return altitude * g;
}

int main(void) {
    printf("%f\\n", stoop(300));
    return 0;
}`,
  cpp:`#include <iostream>

class Falcon {
public:
    double topSpeed = 389.0;
    void dive() { std::cout << "stooping" << std::endl; }
};

int main() {
    Falcon bird;
    bird.dive();
}`,
  java:`public class Falcon {
    private double topSpeed = 389.0;

    public double stoop(double altitude) {
        double g = 9.81;
        return altitude * g;
    }
}`,
  csharp:`public class Falcon {
    public double TopSpeed = 389.0;

    public double Stoop(double altitude) {
        var g = 9.81;
        return altitude * g;
    }
}`,
  php:`<?php
function stoop($altitude) {
    $g = 9.81;
    return $altitude * $g;
}

echo stoop(300);`,
  ruby:`def stoop(altitude)
  g = 9.81
  altitude * g
end

puts stoop(300)`,
  swift:`func stoop(_ altitude: Double) -> Double {
    let g = 9.81
    return altitude * g
}

print(stoop(300))`,
  kotlin:`fun stoop(altitude: Double): Double {
    val g = 9.81
    return altitude * g
}

fun main() { println(stoop(300.0)) }`,
  sql:`SELECT filename, theme
FROM codeshots
WHERE exported = true
ORDER BY created_at DESC
LIMIT 10;`,
  yaml:`name: CodeShot
top_speed: 389
silent: true
themes:
  - Obsidian
  - Nordwing
  - Titanium`,
  markdown:`# CodeShot

Silent. Precise. **Fast.**

- Obsidian
- Nordwing
- Titanium`,
  xml:`<codeshot>
  <name>CodeShot</name>
  <topSpeed>389</topSpeed>
</codeshot>`,
  scss:`$gold: #cfa740;

.wing {
  background: linear-gradient(135deg, $gold, #0d0f12);
  &:hover { transform: translateY(-2px); }
}`,
  less:`@gold: #cfa740;

.wing {
  background: linear-gradient(135deg, @gold, #0d0f12);
}`,
  lua:`function stoop(altitude)
  local g = 9.81
  return altitude * g
end

print(stoop(300))`,
  perl:`sub stoop {
  my ($altitude) = @_;
  my $g = 9.81;
  return $altitude * $g;
}

print stoop(300);`,
  dart:`double stoop(double altitude) {
  final g = 9.81;
  return altitude * g;
}

void main() => print(stoop(300));`,
  graphql:`query GetTheme {
  theme(name: "Obsidian") {
    accent
    mode
  }
}`,
  dockerfile:`FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]`,
  powershell:`function Stoop($altitude) {
    $g = 9.81
    return $altitude * $g
}

Write-Host (Stoop 300)`
};

let state = {
  lang:'ts', theme:'obsidian', filename:'glide.ts', bg:'grad-obsidian',
  padding:56, radius:18, fontSize:13, lineNumbers:true, watermark:true,
  fontFamily:"'JetBrains Mono'", customColor:'#141518', shadow:'medium', sizePreset:'auto',
  code: SAMPLES.ts
};

const $ = id=>document.getElementById(id);
const codeInput=$('code-input'), langSelect=$('lang-select'), filenameInput=$('filename-input'),
      bgSelect=$('bg-select'), padRange=$('pad-range'), radRange=$('rad-range'), fontRange=$('font-range'),
      toggleLines=$('toggle-lines'), toggleWatermark=$('toggle-watermark'),
      liveWindow=$('live-window'), liveFilename=$('live-filename'), liveLines=$('live-lines'),
      liveLinenums=$('live-linenums'), liveWatermark=$('live-watermark'), previewStage=$('preview-stage'),
      fontSelect=$('font-select'), bgColorField=$('bg-color-field'), bgColorInput=$('bg-color-input'),
      shadowSelect=$('shadow-select'), sizeSelect=$('size-select');

const SHADOWS = {
  none:'none',
  soft:'0 20px 50px -20px rgba(0,0,0,.45)',
  medium:'0 40px 90px -30px rgba(0,0,0,.7), 0 2px 0 rgba(255,255,255,.03) inset',
  hard:'0 26px 0 -4px rgba(0,0,0,.85), 0 2px 0 rgba(255,255,255,.05) inset'
};
const SIZES = { twitter:{w:1200,h:675}, instagram:{w:1080,h:1350}, pinterest:{w:1000,h:1500} };

codeInput.value = state.code;

function applyTheme(){
  const th = THEMES[state.theme];
  document.querySelectorAll('#live-window, #hero-window').forEach(w=>{
    w.style.setProperty('--tw-bg', th.bg);
    w.style.background = th.bg;
    w.style.color = th.text;
  });
  const styleTag = document.getElementById('theme-tok-style') || (()=>{ const s=document.createElement('style'); s.id='theme-tok-style'; document.head.appendChild(s); return s; })();
  styleTag.textContent = `
    .tok-kw{color:${th.kw}} .tok-st{color:${th.st}} .tok-cm{color:${th.cm}}
    .tok-fn{color:${th.fn}} .tok-nu{color:${th.nu}} .tok-pu{color:${th.pu}}
  `;
}

function renderLive(){
  liveFilename.textContent = state.filename;
  const html = highlightToHTML(state.code, state.lang);
  liveLines.innerHTML = html || '&nbsp;';
  const fluidFont = `clamp(11px, ${(state.fontSize/16).toFixed(2)}vw, ${state.fontSize}px)`;
  liveLines.style.fontSize = fluidFont;
  const lineCount = state.code.split('\n').length;
  liveLinenums.style.fontSize = fluidFont;
  liveLinenums.style.display = state.lineNumbers ? 'block' : 'none';
  liveLinenums.innerHTML = Array.from({length:lineCount},(_,i)=>i+1).join('<br>');
  liveWatermark.style.display = state.watermark ? 'block':'none';
  liveWindow.style.borderRadius = state.radius+'px';
  liveWindow.style.boxShadow = SHADOWS[state.shadow];
  const fam = state.fontFamily==='system' ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" : `${state.fontFamily}, monospace`;
  liveLines.style.fontFamily = fam;
  liveLinenums.style.fontFamily = fam;
  liveFilename.style.fontFamily = fam;
  document.getElementById('live-code-body').style.padding = '22px 26px 36px';
  bgColorField.style.display = state.bg==='custom' ? 'block' : 'none';
  previewStage.style.padding = `clamp(18px, 6vw, ${state.padding}px)`;
  previewStage.style.background = state.bg==='custom' ? state.customColor : BGSTYLES[state.bg];
  applyTheme();
}

langSelect.addEventListener('change', ()=>{
  state.lang = langSelect.value;
  state.code = SAMPLES[state.lang] || '';
  codeInput.value = state.code;
  state.filename = state.lang==='dockerfile' ? 'Dockerfile' : ('glide.' + EXT[state.lang]);
  filenameInput.value = state.filename;
  renderLive();
});
codeInput.addEventListener('input', ()=>{ state.code = codeInput.value; renderLive(); });
filenameInput.addEventListener('input', ()=>{ state.filename = filenameInput.value; renderLive(); });
bgSelect.addEventListener('change', ()=>{ state.bg = bgSelect.value; renderLive(); });
bgColorInput.addEventListener('input', ()=>{ state.customColor = bgColorInput.value; renderLive(); });
fontSelect.addEventListener('change', ()=>{ state.fontFamily = fontSelect.value; renderLive(); });
shadowSelect.addEventListener('change', ()=>{ state.shadow = shadowSelect.value; renderLive(); });
sizeSelect.addEventListener('change', ()=>{ state.sizePreset = sizeSelect.value; });
padRange.addEventListener('input', ()=>{ state.padding = +padRange.value; $('pad-val').textContent = state.padding+'px'; renderLive(); });
radRange.addEventListener('input', ()=>{ state.radius = +radRange.value; $('rad-val').textContent = state.radius+'px'; renderLive(); });
fontRange.addEventListener('input', ()=>{ state.fontSize = +fontRange.value; $('font-val').textContent = state.fontSize+'px'; renderLive(); });
toggleLines.addEventListener('change', ()=>{ state.lineNumbers = toggleLines.checked; renderLive(); });
toggleWatermark.addEventListener('change', ()=>{ state.watermark = toggleWatermark.checked; renderLive(); });

const swatchWrap = $('theme-swatches'), gallery = $('theme-gallery');
Object.entries(THEMES).forEach(([key,th])=>{
  const grad = `linear-gradient(135deg, ${th.bg}, ${th.fn})`;
  const sw = document.createElement('div');
  sw.className='swatch'+(key===state.theme?' active':'');
  sw.style.background = grad;
  sw.title = th.name;
  sw.addEventListener('click', ()=>{
    state.theme = key;
    document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll(`.swatch[title="${th.name}"]`).forEach(s=>s.classList.add('active'));
    renderLive();
  });
  swatchWrap.appendChild(sw);

  const card = document.createElement('div');
  card.className='tilt-card';
  card.dataset.mode = th.mode;
  card.innerHTML = `<div class="chip-preview" style="background:${grad}"></div><h3>${th.name}</h3><p>${th.mode==='light'?'Light':'Dark'} · Kw ${th.kw} · Str ${th.st}</p>`;
  card.addEventListener('click', ()=>{ state.theme=key; document.querySelectorAll('.swatch').forEach(s=>s.classList.toggle('active', s.title===th.name)); renderLive(); window.scrollTo({top:document.getElementById('studio').offsetTop-70, behavior:'smooth'}); });
  gallery.appendChild(card);
});

document.getElementById('theme-filter').addEventListener('click', e=>{
  const btn = e.target.closest('.filter-pill'); if(!btn) return;
  document.querySelectorAll('.filter-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  document.querySelectorAll('#theme-gallery .tilt-card').forEach(card=>{
    card.style.display = (f==='all' || card.dataset.mode===f) ? '' : 'none';
  });
});

document.addEventListener('pointermove', e=>{
  document.querySelectorAll('.tilt-card').forEach(card=>{
    const r = card.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){ card.style.transform=''; return; }
    const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
    card.style.transform = `rotateX(${(-py*8).toFixed(2)}deg) rotateY(${(px*8).toFixed(2)}deg) translateY(-2px)`;
  });
});

renderLive();

const heroBody = $('hero-code-body');
const heroSample = SAMPLES.ts;
let heroPos = 0;
function typeHero(){
  if(reduced){ heroBody.innerHTML = highlightToHTML(heroSample,'ts'); return; }
  heroPos += Math.max(1, Math.floor(Math.random()*3));
  const slice = heroSample.slice(0, heroPos);
  heroBody.innerHTML = highlightToHTML(slice,'ts') + '<span style="opacity:.6">▍</span>';
  if(heroPos < heroSample.length){ setTimeout(typeHero, 16+Math.random()*26); }
  else { setTimeout(()=>{ heroPos=0; typeHero(); }, 3200); }
}
setTimeout(typeHero, 900);

const shutter = $('shutter');
function fireShutter(){ shutter.classList.remove('fire'); void shutter.offsetWidth; shutter.classList.add('fire'); }
function baseName(){ return (state.filename||'codeshot').replace(/\.[^.]+$/,'') || 'codeshot'; }

function fillCanvasBackground(ctx, w, h){
  if(state.bg==='transparent') return;
  if(state.bg==='custom'){ ctx.fillStyle = state.customColor; ctx.fillRect(0,0,w,h); return; }
  if(state.bg==='solid'){ ctx.fillStyle = '#141518'; ctx.fillRect(0,0,w,h); return; }
  const gold = state.bg==='grad-gold';
  const cx = gold ? w*0.7 : w*0.3, cy = h*0.2;
  const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*0.85);
  grad.addColorStop(0, gold?'#2a2313':'#1c1e22');
  grad.addColorStop(1, gold?'#0d0d0e':'#0a0a0b');
  ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
}

async function captureCanvas(){
  if(!window.html2canvas) throw new Error('html2canvas unavailable');
  const scale = 2;
  if(state.sizePreset === 'auto'){
    return await html2canvas(previewStage, { scale, backgroundColor:null, useCORS:true, logging:false });
  }
  const winCanvas = await html2canvas(liveWindow, { scale, backgroundColor:null, useCORS:true, logging:false });
  const {w,h} = SIZES[state.sizePreset];
  const W = w*scale, H = h*scale;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const octx = out.getContext('2d');
  fillCanvasBackground(octx, W, H);
  const marginPx = state.padding*scale;
  const maxW = W - marginPx*2, maxH = H - marginPx*2;
  const ratio = Math.min(maxW/winCanvas.width, maxH/winCanvas.height, 1);
  const drawW = winCanvas.width*ratio, drawH = winCanvas.height*ratio;
  octx.drawImage(winCanvas, (W-drawW)/2, (H-drawH)/2, drawW, drawH);
  return out;
}
function download(filename, blobOrUrl){
  const a = document.createElement('a');
  a.href = typeof blobOrUrl==='string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}
$('btn-png').addEventListener('click', async ()=>{
  fireShutter();
  try{
    const canvas = await captureCanvas();
    canvas.toBlob(blob=>download(baseName()+'.png', blob), 'image/png');
  }catch(e){ console.error(e); alert('PNG export failed to render in this browser. Try Chrome, or reload and try again.'); }
});
$('btn-svg').addEventListener('click', async ()=>{
  fireShutter();
  try{
    const canvas = await captureCanvas();
    const dataURL = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image width="100%" height="100%" href="${dataURL}"/></svg>`;
    download(baseName()+'.svg', new Blob([svg],{type:'image/svg+xml'}));
  }catch(e){ console.error(e); alert('SVG export failed — note this embeds a raster image in an SVG wrapper rather than true vector text.'); }
});
$('btn-pdf').addEventListener('click', async ()=>{
  fireShutter();
  try{
    const canvas = await captureCanvas();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation: canvas.width>canvas.height?'l':'p', unit:'px', format:[canvas.width, canvas.height]});
    pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,canvas.width,canvas.height);
    pdf.save(baseName()+'.pdf');
  }catch(e){ console.error(e); alert('PDF export failed — try PNG export instead.'); }
});
$('btn-copy-img').addEventListener('click', async ()=>{
  fireShutter();
  try{
    const canvas = await captureCanvas();
    canvas.toBlob(async blob=>{
      try{ await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]); }
      catch(err){ alert("Clipboard image copy isn't supported in this browser — use PNG download instead."); }
    });
  }catch(e){ console.error(e); alert('Could not prepare the image for clipboard.'); }
});
$('btn-copy-code').addEventListener('click', ()=>{
  navigator.clipboard.writeText(state.code);
});

const overlay=$('palette-overlay'), palInput=$('palette-input'), palList=$('palette-list');
const commands = [
  {label:'Focus code editor', kbd:'', run:()=>{ closePalette(); codeInput.focus(); document.getElementById('studio').scrollIntoView({behavior:'smooth'}); }},
  {label:'Copy code to clipboard', kbd:'', run:()=>{ closePalette(); $('btn-copy-code').click(); }},
  {label:'Copy image to clipboard', kbd:'⌘⇧C', run:()=>{ closePalette(); $('btn-copy-img').click(); }},
  {label:'Export PNG', kbd:'⌘S', run:()=>{ closePalette(); $('btn-png').click(); }},
  {label:'Export SVG', kbd:'⌘⇧S', run:()=>{ closePalette(); $('btn-svg').click(); }},
  {label:'Export PDF', kbd:'⌘E', run:()=>{ closePalette(); $('btn-pdf').click(); }},
  {label:'Toggle line numbers', kbd:'⌘\\', run:()=>{ closePalette(); toggleLines.checked=!toggleLines.checked; toggleLines.dispatchEvent(new Event('change')); }},
  {label:'Toggle light / dark interface', kbd:'⌘J', run:()=>{ closePalette(); toggleUIMode(); }},
  {label:'Cycle theme', kbd:'', run:()=>{ closePalette(); const keys=Object.keys(THEMES); const i=(keys.indexOf(state.theme)+1)%keys.length; state.theme=keys[i]; document.querySelectorAll('.swatch').forEach(s=>s.classList.toggle('active', s.title===THEMES[state.theme].name)); renderLive(); }},
  {label:'Scroll to themes', kbd:'', run:()=>{ closePalette(); document.getElementById('themes').scrollIntoView({behavior:'smooth'}); }},
  {label:'Show keyboard shortcuts', kbd:'?', run:()=>{ closePalette(); openShortcuts(); }},
];
let selIdx=0, filtered=commands;
function renderPalette(){
  filtered = commands.filter(c=>c.label.toLowerCase().includes(palInput.value.toLowerCase()));
  selIdx = Math.min(selIdx, Math.max(0,filtered.length-1));
  palList.innerHTML = filtered.map((c,i)=>`<div class="pal-item ${i===selIdx?'sel':''}" data-i="${i}">${c.label}<kbd>${c.kbd}</kbd></div>`).join('') || '<div class="pal-item">No matching command</div>';
}
function openPalette(){ overlay.classList.add('open'); palInput.value=''; selIdx=0; renderPalette(); setTimeout(()=>palInput.focus(),50); }
function closePalette(){ overlay.classList.remove('open'); }
$('palette-trigger').addEventListener('click', e=>{ e.preventDefault(); openPalette(); });
overlay.addEventListener('click', e=>{ if(e.target===overlay) closePalette(); });
palInput.addEventListener('input', renderPalette);
palList.addEventListener('click', e=>{ const item=e.target.closest('.pal-item'); if(item && filtered[+item.dataset.i]) filtered[+item.dataset.i].run(); });
document.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); overlay.classList.contains('open') ? closePalette() : openPalette(); return; }
  if(!overlay.classList.contains('open')) return;
  if(e.key==='Escape') closePalette();
  if(e.key==='ArrowDown'){ e.preventDefault(); selIdx=Math.min(selIdx+1, filtered.length-1); renderPalette(); }
  if(e.key==='ArrowUp'){ e.preventDefault(); selIdx=Math.max(selIdx-1,0); renderPalette(); }
  if(e.key==='Enter'){ e.preventDefault(); if(filtered[selIdx]) filtered[selIdx].run(); }
});

const shortcutsOverlay = $('shortcuts-overlay');
function openShortcuts(){ shortcutsOverlay.classList.add('open'); }
function closeShortcuts(){ shortcutsOverlay.classList.remove('open'); }
shortcutsOverlay.addEventListener('click', e=>{ if(e.target===shortcutsOverlay) closeShortcuts(); });
document.getElementById('shortcuts-trigger').addEventListener('click', e=>{ e.preventDefault(); openShortcuts(); });
document.getElementById('shortcuts-trigger-2').addEventListener('click', e=>{ e.preventDefault(); openShortcuts(); });

document.addEventListener('keydown', e=>{
  const tag = document.activeElement && document.activeElement.tagName;
  const typing = tag==='TEXTAREA' || tag==='INPUT' || tag==='SELECT';
  if(overlay.classList.contains('open') || shortcutsOverlay.classList.contains('open')){
    if(e.key==='Escape'){ closePalette(); closeShortcuts(); }
    return;
  }
  const mod = e.metaKey || e.ctrlKey;
  if(mod && !e.shiftKey && e.key.toLowerCase()==='s'){ e.preventDefault(); $('btn-png').click(); return; }
  if(mod && e.shiftKey && e.key.toLowerCase()==='s'){ e.preventDefault(); $('btn-svg').click(); return; }
  if(mod && e.key.toLowerCase()==='e'){ e.preventDefault(); $('btn-pdf').click(); return; }
  if(mod && e.shiftKey && e.key.toLowerCase()==='c'){ e.preventDefault(); $('btn-copy-img').click(); return; }
  if(mod && e.key==='\\'){ e.preventDefault(); toggleLines.checked=!toggleLines.checked; toggleLines.dispatchEvent(new Event('change')); return; }
  if(mod && e.key.toLowerCase()==='j'){ e.preventDefault(); toggleUIMode(); return; }
  if(!typing && e.key==='?'){ e.preventDefault(); openShortcuts(); return; }
});

})();
