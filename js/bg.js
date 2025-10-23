// Lightweight particle nebula using canvas blended circles
export function startBackground(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w,h, dpr = Math.min(window.devicePixelRatio||1, 2);
  const particles = [];
  function resize(){
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth+'px';
    canvas.style.height = window.innerHeight+'px';
  }
  window.addEventListener('resize', resize); resize();

  const colors = [
    [160,32,240],
    [217,0,119],
    [120,200,255]
  ];
  function spawn(){
    for(let i=0;i<28;i++){
      const c = colors[Math.floor(Math.random()*colors.length)];
      particles.push({
        x: Math.random()*w, y: Math.random()*h,
        r: 100 + Math.random()*220,
        dx: (-0.2 + Math.random()*0.4) * dpr,
        dy: (-0.2 + Math.random()*0.4) * dpr,
        color: c, alpha: 0.02 + Math.random()*0.06
      });
    }
  }
  spawn();

  function tick(){
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    for(const p of particles){
      p.x += p.dx; p.y += p.dy;
      if (p.x < -200 || p.x > w+200) p.dx *= -1;
      if (p.y < -200 || p.y > h+200) p.dy *= -1;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
}