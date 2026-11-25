const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const mobileNav = matchMedia('(max-width: 700px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
  siteNav.classList.toggle('is-open', open);
}

function updateMenu() {
  setMenu(false);
  menuToggle.hidden = !mobileNav.matches;
}

menuToggle.addEventListener('click', () => setMenu(!siteNav.classList.contains('is-open')));
siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenu(false);
    if (!mobileNav.matches || !link.getAttribute('href').startsWith('#')) return;
    const target = document.querySelector(link.getAttribute('href'));
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !siteNav.classList.contains('is-open')) return;
  setMenu(false);
  menuToggle.focus();
});
mobileNav.addEventListener('change', updateMenu);
updateMenu();

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      reveal.unobserve(entry.target);
    }
  }, { threshold: .14 });

  document.querySelectorAll('[data-reveal]').forEach((element) => reveal.observe(element));
}

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.bento-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--px', `${event.clientX - rect.left}px`);
      card.style.setProperty('--py', `${event.clientY - rect.top}px`);
    });
  });
}

const field = document.querySelector('#brand-field');
const context = field?.getContext('2d');

if (context) {
  const hero = field.closest('.hero');
  const turns = Math.PI * 2;
  const sections = 66;
  const rails = 12;
  const mesh = Array.from({ length: rails }, (_, rail) => {
    const v = rail * turns / rails;
    return Array.from({ length: sections }, (_, section) => {
      const u = section * turns / sections;
      const roll = v + u * 3;
      const radius = 1.25 + .38 * Math.cos(roll);
      return [radius * Math.cos(u), radius * Math.sin(u), .38 * Math.sin(roll)];
    });
  });
  let width = 0;
  let height = 0;
  let aimX = 0;
  let aimY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let frame = 0;
  let visible = true;

  function paint(time) {
    tiltX += (aimX - tiltX) * .07;
    tiltY += (aimY - tiltY) * .07;
    const spin = time * .00023;
    const pitch = .69 + tiltY * .28;
    const yaw = -.35 + tiltX * .35;
    const scale = Math.min(width, height) * .27;
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const sinSpin = Math.sin(spin);
    const cosSpin = Math.cos(spin);

    const points = mesh.map((rail) => rail.map(([x, y, z]) => {
      const horizontal = x * cosSpin - y * sinSpin;
      const vertical = x * sinSpin + y * cosSpin;
      const depth = vertical * sinPitch + z * cosPitch;
      const rotatedX = horizontal * cosYaw + depth * sinYaw;
      const rotatedZ = depth * cosYaw - horizontal * sinYaw;
      const perspective = scale / (1 - rotatedZ * .16);
      return [width * .52 + rotatedX * perspective, height * .49 + (vertical * cosPitch - z * sinPitch) * perspective];
    }));

    context.clearRect(0, 0, width, height);
    const light = context.createLinearGradient(width * .13, height * .76, width * .82, height * .18);
    light.addColorStop(0, '#4e56b65c');
    light.addColorStop(.5, '#929dffc5');
    light.addColorStop(1, '#b9dcff');
    context.strokeStyle = light;
    context.lineWidth = 1;

    for (const rail of points) {
      context.beginPath();
      context.moveTo(...rail[0]);
      for (const point of rail.slice(1)) context.lineTo(...point);
      context.closePath();
      context.stroke();
    }

    context.globalAlpha = .36;
    for (let index = 0; index < sections; index += 3) {
      context.beginPath();
      context.moveTo(...points[0][index]);
      for (const rail of points.slice(1)) context.lineTo(...rail[index]);
      context.closePath();
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  function tick(time) {
    paint(time);
    frame = requestAnimationFrame(tick);
  }

  function updateAnimation() {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden && !reducedMotion.matches) {
      frame = requestAnimationFrame(tick);
    } else if (visible) {
      aimX = aimY = tiltX = tiltY = 0;
      paint(0);
    }
  }

  function resizeField() {
    width = field.clientWidth;
    height = field.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    field.width = Math.round(width * ratio);
    field.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    paint(0);
  }

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    aimX = (event.clientX - rect.left) / rect.width - .5;
    aimY = (event.clientY - rect.top) / rect.height - .5;
  });
  hero.addEventListener('pointerleave', () => { aimX = aimY = 0; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAnimation();
    }).observe(hero);
  }
  window.addEventListener('resize', resizeField);
  document.addEventListener('visibilitychange', updateAnimation);
  reducedMotion.addEventListener('change', updateAnimation);
  resizeField();
  updateAnimation();
}
