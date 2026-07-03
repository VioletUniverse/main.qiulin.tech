!function(){
'use strict';

/* === Preloader === */
var preloader=document.getElementById('preloader');
var heroInner=document.querySelector('.hero-inner');
var scrollHint=document.getElementById('scrollHint');

window.addEventListener('load',function(){
  setTimeout(function(){
    preloader.classList.add('done');
    setTimeout(function(){
      heroInner.classList.add('show');
      setTimeout(function(){scrollHint.classList.add('show')},1000);
    },600);
  },1000);
});

/* === Canvas: particles + shooting stars === */
var canvas=document.getElementById('canvas');
var ctx=canvas.getContext('2d');
var W,H;

function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
resize();
window.addEventListener('resize',resize);

/* Particles */
var particles=[];
var PC=120;

function P(){this.reset();this.y=Math.random()*H}
P.prototype.reset=function(){
  this.x=Math.random()*W;this.y=-10;
  this.vx=(Math.random()-.5)*.3;this.vy=.15+Math.random()*.4;
  this.r=1+Math.random()*1.5;this.a=.15+Math.random()*.35;
  this.p=Math.random()*Math.PI*2;this.ps=.01+Math.random()*.02;
};
P.prototype.update=function(){this.x+=this.vx;this.y+=this.vy;this.p+=this.ps;if(this.y>H+10||this.x<-10||this.x>W+10)this.reset()};
P.prototype.draw=function(){
  var o=this.a*(.6+.4*Math.sin(this.p));
  ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
  ctx.fillStyle='rgba(196,181,253,'+o+')';ctx.fill();
};

for(var i=0;i<PC;i++){var p=new P();particles.push(p)}

/* Shooting stars */
var stars=[];
function S(){this.reset()}
S.prototype.reset=function(){this.on=false;this.t=200+Math.random()*600};
S.prototype.launch=function(){
  this.on=true;this.x=Math.random()*W*.8;this.y=Math.random()*H*.3;
  this.len=80+Math.random()*120;this.sp=6+Math.random()*6;
  this.ang=(25+Math.random()*20)*Math.PI/180;
  this.vx=Math.cos(this.ang)*this.sp;this.vy=Math.sin(this.ang)*this.sp;
  this.a=.6+Math.random()*.4;this.life=0;this.ml=60+Math.random()*40;
};
S.prototype.update=function(){
  if(!this.on){this.t--;if(this.t<=0)this.launch();return}
  this.x+=this.vx;this.y+=this.vy;this.life++;if(this.life>this.ml)this.reset();
};
S.prototype.draw=function(){
  if(!this.on)return;
  var pr=this.life/this.ml,o=this.a*(1-pr);
  var tx=this.x-Math.cos(this.ang)*this.len*(1-pr*.5);
  var ty=this.y-Math.sin(this.ang)*this.len*(1-pr*.5);
  var g=ctx.createLinearGradient(tx,ty,this.x,this.y);
  g.addColorStop(0,'rgba(196,181,253,0)');g.addColorStop(1,'rgba(230,220,255,'+o+')');
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(this.x,this.y);
  ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.arc(this.x,this.y,2,0,Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,'+o*.8+')';ctx.fill();
};

for(i=0;i<4;i++){var s=new S();s.t=Math.random()*400;stars.push(s)}

/* Connections */
function drawConn(){
  var md=120;
  for(var i=0;i<particles.length;i++){
    for(var j=i+1;j<particles.length;j++){
      var dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      var d=Math.sqrt(dx*dx+dy*dy);
      if(d<md){
        var a=(1-d/md)*.06;
        ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);
        ctx.strokeStyle='rgba(180,160,248,'+a+')';ctx.lineWidth=.5;ctx.stroke();
      }
    }
  }
}

/* Loop */
function animate(){
  ctx.clearRect(0,0,W,H);
  for(var i=0;i<particles.length;i++){particles[i].update();particles[i].draw()}
  drawConn();
  for(i=0;i<stars.length;i++){stars[i].update();stars[i].draw()}
  requestAnimationFrame(animate);
}
animate();

/* === Cursor Glow === */
var glow=document.getElementById('glow');
if(window.matchMedia('(pointer:fine)').matches){
  var mx=0,my=0,gx=0,gy=0;
  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;glow.classList.add('on')});
  document.addEventListener('mouseleave',function(){glow.classList.remove('on')});
  !function loop(){gx+=(mx-gx)*.06;gy+=(my-gy)*.06;glow.style.left=gx+'px';glow.style.top=gy+'px';requestAnimationFrame(loop)}();
}

/* === Love Pages === */
var lps=document.querySelectorAll('.lp');

function updateLP(){
  var vh=window.innerHeight;
  for(var i=0;i<lps.length;i++){
    var page=lps[i];
    var rect=page.getBoundingClientRect();
    var text=page.querySelector('.lp-sticky');
    var chars=page.querySelectorAll('.lc');
    if(!text||!chars.length)continue;
    var sH=rect.height,scrolled=-rect.top;
    var raw=Math.max(0,Math.min(1,scrolled/(sH-vh)));
    // Fade: 0~20% in, 20~80% visible, 80~100% out
    var op=0;
    if(raw<.2)op=raw/.2;
    else if(raw<.8)op=1;
    else op=(1-raw)/.2;
    text.style.opacity=Math.max(0,Math.min(1,op));
    // Chars: 15%~75%
    var cp=Math.max(0,Math.min(1,(raw-.15)/.55));
    var rc=Math.floor(cp*chars.length);
    for(var j=0;j<chars.length;j++)chars[j].classList.toggle('on',j<rc);
  }
}

/* === Counters === */
var statNs=document.querySelectorAll('.stat-n');
var counted=false;

function runCount(){
  if(counted||!statNs.length)return;
  for(var i=0;i<statNs.length;i++){
    if(statNs[i].getBoundingClientRect().top<window.innerHeight*.55){counted=true;break}
  }
  if(!counted)return;
  for(i=0;i<statNs.length;i++){
    (function(el){
      var to=+el.dataset.to,st=performance.now();
      !function tick(now){
        var p=Math.min((now-st)/2000,1);
        el.textContent=Math.round((1-Math.pow(1-p,3))*to);
        if(p<1)requestAnimationFrame(tick);
      }(st);
    })(statNs[i]);
  }
}

/* === Reveal === */
var revs=document.querySelectorAll('.rev');
var hintHidden=false;

function onScroll(){
  var vh=window.innerHeight;
  if(!hintHidden&&window.scrollY>80){scrollHint.classList.remove('show');hintHidden=true}
  updateLP();
  for(var i=0;i<revs.length;i++){
    if(revs[i].getBoundingClientRect().top<vh*.85){revs[i].style.transitionDelay=(i%4)*.12+'s';revs[i].classList.add('show')}
  }
  runCount();
  parallax();
}
window.addEventListener('scroll',onScroll,{passive:true});
onScroll();

/* === Parallax === */
var heroTitle=document.querySelector('.hero-title');
var heroSub=document.querySelector('.hero-sub');
var heroTag=document.querySelector('.hero-tag');

function parallax(){
  var s=window.scrollY;if(s>=window.innerHeight)return;
  var r=s/window.innerHeight;
  if(heroTitle){heroTitle.style.transform='translateY('+s*.3+'px) scale('+(1-r*.1)+')';heroTitle.style.opacity=Math.max(0,1-r*1.3)}
  if(heroSub){heroSub.style.transform='translateY('+s*.15+'px)';heroSub.style.opacity=Math.max(0,1-r*1.5)}
  if(heroTag){heroTag.style.transform='translateY('+s*.2+'px)';heroTag.style.opacity=Math.max(0,1-r*1.5)}
}

/* === Mobile Menu === */
var menuBtn=document.getElementById('menuBtn');
var menu=document.getElementById('menu');
var menuOpen=false;
menuBtn.addEventListener('click',function(){menuOpen=!menuOpen;menu.classList.toggle('open',menuOpen);menuBtn.textContent=menuOpen?'Close':'Menu'});
var menuAs=menu.querySelectorAll('a');
for(i=0;i<menuAs.length;i++)menuAs[i].addEventListener('click',function(){menuOpen=false;menu.classList.remove('open');menuBtn.textContent='Menu'});

}();
