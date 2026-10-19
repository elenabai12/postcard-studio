'use strict';
const canvas = document.querySelector('#postcard');
const ctx = canvas.getContext('2d');
const message = document.querySelector('#message');
const photoInput = document.querySelector('#photo');
const status = document.querySelector('#status');
const palettes = {
  strawberry: { paper: '#fff6e5', border: '#ef9eaf', ink: '#79474e', accent: '#dc647f', stamp: '#f4c85c', sky: '#b8d8ec', hill: '#98ae75' },
  seaside: { paper: '#fff9e8', border: '#a5cce5', ink: '#3d6476', accent: '#5689a3', stamp: '#f4d978', sky: '#b8dfe7', hill: '#719d98' },
  matcha: { paper: '#fcf5e5', border: '#b5c897', ink: '#526747', accent: '#6f8a59', stamp: '#efb49a', sky: '#d4e2c0', hill: '#8ba66d' }
};
let theme = 'strawberry';
let photo = null;
let uploadVersion = 0;
let loading = false;

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function circle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function text(value, x, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}
function flower(x, y, size, color) {
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    circle(x + Math.cos(a) * size * .6, y + Math.sin(a) * size * .6, size * .43, color);
  }
  circle(x, y, size * .26, '#f5c964');
}
function sample(p) {
  rect(65, 76, 508, 552, p.sky);
  circle(454, 174, 48, '#ffe6a0');
  [[155,172,34],[197,164,43],[232,180,29],[350,279,22],[379,268,29],[408,281,22]]
    .forEach(([x,y,r]) => circle(x,y,r,'#fff9ed'));
  ctx.fillStyle = p.hill;
  ctx.beginPath();
  ctx.moveTo(65,415);
  ctx.bezierCurveTo(240,230,370,455,573,335);
  ctx.lineTo(573,628);
  ctx.lineTo(65,628);
  ctx.fill();
  ctx.fillStyle = '#bdc78c';
  ctx.beginPath();
  ctx.moveTo(65,478);
  ctx.bezierCurveTo(265,349,365,480,573,445);
  ctx.lineTo(573,628);
  ctx.lineTo(65,628);
  ctx.fill();
  ctx.fillStyle = '#f5dfb2';
  ctx.beginPath();
  ctx.moveTo(291,628);
  ctx.bezierCurveTo(252,537,408,499,362,421);
  ctx.bezierCurveTo(449,496,335,558,418,628);
  ctx.fill();
  rect(156,380,112,92,'#fff0d4');
  ctx.fillStyle = '#ce7d6d';
  ctx.beginPath();
  ctx.moveTo(139,383);
  ctx.lineTo(213,326);
  ctx.lineTo(284,383);
  ctx.fill();
  rect(199,424,25,48,'#82999a');
  rect(170,404,18,22,'#eeb88c');
  rect(238,404,18,22,'#eeb88c');
  [[106,543,12],[158,584,15],[474,542,13],[515,592,17],[224,518,9],[105,463,8]]
    .forEach(([x,y,s]) => flower(x,y,s,'#fff9ed'));
}
function stamp(p) {
  const x = 1000, y = 77, w = 127, h = 149;
  rect(x,y,w,h,p.accent);
  for (let i=0;i<=w;i+=16) {
    circle(x+i,y,5,p.paper);
    circle(x+i,y+h,5,p.paper);
  }
  for (let i=0;i<=h;i+=16) {
    circle(x,y+i,5,p.paper);
    circle(x+w,y+i,5,p.paper);
  }
  rect(x+12,y+12,w-24,h-24,p.stamp);
  flower(x+64,y+62,28,p.paper);
  text('LITTLE POST',x+22,y+112,'bold 11px Arial',p.ink);
  text('♡  01',x+42,y+130,'12px Georgia',p.ink);
  ctx.save();
  ctx.strokeStyle=p.ink;
  ctx.globalAlpha=.5;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(981,160,53,0,Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(981,160,46,0,Math.PI*2);
  ctx.stroke();
  for(let i=0;i<3;i++) {
    ctx.beginPath();
    ctx.moveTo(859,140+i*15);
    ctx.bezierCurveTo(900,120+i*15,919,165+i*15,963,140+i*15);
    ctx.stroke();
  }
  ctx.restore();
}
function wrapLines(value, width) {
  const lines = [];
  for (const paragraph of value.split('\n')) {
    let line = '';
    const chars = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(paragraph), s=>s.segment)
      : Array.from(paragraph);
    for (const char of chars) {
      if (ctx.measureText(line + char).width > width && line) {
        const space = line.lastIndexOf(' ');
        if (space > 0 && char !== ' ') {
          lines.push(line.slice(0, space));
          line = line.slice(space+1) + char;
        } else {
          lines.push(line);
          line = char === ' ' ? '' : char;
        }
      } else {
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}
function render() {
  const p = palettes[theme];
  ctx.clearRect(0,0,1200,800);
  rect(0,0,1200,800,p.border);
  rect(22,22,1156,756,p.paper);
  for(let i=0;i<460;i++) {
    const x=(i*137.3)%1150+25,y=(i*79.7)%750+25;
    rect(x,y,1.2,1.2,'#ae8e6316');
  }
  rect(51,62,536,615,'#fffdf5');
  if(photo) {
    const scale = Math.max(508/photo.width,552/photo.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(65,76,508,552);
    ctx.clip();
    ctx.drawImage(photo,65+(508-photo.width*scale)/2,76+(552-photo.height*scale)/2,photo.width*scale,photo.height*scale);
    ctx.restore();
  } else {
    sample(p);
  }
  ctx.save();
  ctx.translate(91,57);
  ctx.rotate(-.10);
  ctx.globalAlpha=.8;
  rect(0,0,127,36,'#f5d59b');
  ctx.restore();
  text('a moment worth keeping',159,658,'italic 23px Georgia',p.ink);
  ctx.strokeStyle=p.border;
  ctx.lineWidth=2;
  ctx.setLineDash([6,9]);
  ctx.beginPath();
  ctx.moveTo(621,77);
  ctx.lineTo(621,677);
  ctx.stroke();
  ctx.setLineDash([]);
  text('POST CARD',661,114,'18px Georgia',p.ink);
  text('a little note from today ♡',661,278,'italic 23px Georgia',p.accent);
  const value=message.value;
  let fontSize=29,lines;
  do {
    ctx.font=`${fontSize}px Georgia`;
    lines=wrapLines(value,459);
    if(lines.length*fontSize*1.45<=290) break;
    fontSize--;
  } while(fontSize>1);
  lines.forEach((line,i) => text(line,661,332+i*fontSize*1.45,`${fontSize}px Georgia`,p.ink));
  ctx.strokeStyle=p.border;
  ctx.lineWidth=1;
  [641,678].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(661,y);
    ctx.lineTo(1120,y);
    ctx.stroke();
  });
  text('TO: SOMEONE SPECIAL',663,631,'12px Arial',p.ink);
  text('FROM: A HAPPY LITTLE MOMENT',663,668,'12px Arial',p.ink);
  stamp(p);
  text('LITTLE POSTCARD STUDIO',65,739,'12px Arial',p.ink);
  text('SENT WITH LOVE, ALWAYS.',908,739,'12px Arial',p.ink);
  flower(597,734,12,p.accent);
  document.querySelector('#count').textContent=`${value.length} / 140`;
  canvas.setAttribute('aria-label',`Postcard preview, ${theme} theme, ${photo?'your uploaded photo':'a sample sunny landscape'}. Message: ${value || '(blank)'}`);
}
message.addEventListener('input',render);
document.querySelectorAll('input[name="theme"]').forEach(input => {
  input.addEventListener('change',() => {
    theme=input.value;
    render();
  });
});
photoInput.addEventListener('change',async() => {
  const file=photoInput.files[0];
  if(!file) return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) {
    status.textContent='Please choose a JPG, PNG or WebP photo.';
    photoInput.value='';
    return;
  }
  if(file.size>20*1024*1024) {
    status.textContent='That photo is a little large. Please choose one under 20 MB.';
    photoInput.value='';
    return;
  }
  const version=++uploadVersion;
  loading=true;
  document.querySelector('#download').disabled=true;
  status.textContent='Getting your little moment ready…';
  const url=URL.createObjectURL(file);
  try {
    const image=new Image();
    image.src=url;
    await image.decode();
    if(version!==uploadVersion) return;
    if(!image.naturalWidth||!image.naturalHeight) throw new Error('Invalid image');
    const scaled=document.createElement('canvas');
    const scale=Math.min(1,1800/Math.max(image.naturalWidth,image.naturalHeight));
    scaled.width=Math.max(1,Math.round(image.naturalWidth*scale));
    scaled.height=Math.max(1,Math.round(image.naturalHeight*scale));
    scaled.getContext('2d').drawImage(image,0,0,scaled.width,scaled.height);
    photo=scaled;
    document.querySelector('#upload-label').textContent='Change your photo';
    status.textContent='Your moment is in! Photos are cropped to fill the frame.';
    render();
  } catch {
    if(version===uploadVersion) status.textContent='We couldn’t open that photo. Try another JPG, PNG or WebP.';
  } finally {
    URL.revokeObjectURL(url);
    if(version===uploadVersion) {
      loading=false;
      document.querySelector('#download').disabled=false;
    }
    photoInput.value='';
  }
});
document.querySelector('#download').addEventListener('click',() => {
  if(loading) return;
  render();
  canvas.toBlob(blob => {
    if(!blob) {
      status.textContent='Couldn’t save your postcard. Please try again.';
      return;
    }
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download=`little-postcard-${theme}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url),60000);
    status.textContent='A little keepsake, just for you. Your PNG is ready!';
  },'image/png');
});
render();
