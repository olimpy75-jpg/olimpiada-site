const answers = {
  1:'C',2:'B',3:'A',4:'B',5:'B',6:'A',7:'A',8:'C',9:'D',10:'A',
  11:'D',12:'B',13:'C',14:'A',15:'A',16:'C',17:'A',18:'A',19:'D',20:'A'
};

const textAnswers = {
  21:'100',22:'=E$6',23:'4-3-2-1-',24:'0',25:'start, stop',
  26:'Ctrl+C',27:'def',28:'False',29:'.gif',30:'2006'
};

const points = {1:0.9,2:0.9,3:0.9,4:0.9,5:0.9,6:0.9,7:0.9,8:0.9,9:0.9,10:0.9,
  11:1.5,12:1.5,13:1.5,14:1.5,15:1.5,16:1.5,17:1.5,18:1.5,19:1.5,20:1.5,
  21:2.6,22:2.6,23:2.6,24:2.6,25:2.6,26:2.6,27:2.6,28:2.6,29:2.6,30:2.6};

const userAnswers = {};
const totalQ = 30;

function sel(el) {
  const q = el.getAttribute('data-q');
  document.querySelectorAll('[data-q="'+q+'"]').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  userAnswers[q] = el.getAttribute('data-val');
  checkReady();
}

document.querySelectorAll('.text-answer').forEach(inp => {
  inp.addEventListener('input', function() {
    userAnswers[this.getAttribute('data-q')] = this.value.trim();
    checkReady();
  });
});

function checkReady() {
  document.getElementById('check-btn').disabled = Object.keys(userAnswers).length < totalQ;
}

function norm(s) { return s.replace(/\s+/g,' ').trim().toLowerCase(); }

function checkAll() {
  let score=0, correct=0, wrong=0;

  for (let i=1;i<=20;i++) {
    const card=document.getElementById('q'+i);
    const ua=userAnswers[i]||'';
    const ca=answers[i];
    document.querySelectorAll('[data-q="'+i+'"]').forEach(o=>{
      o.classList.add('disabled');
      const v=o.getAttribute('data-val');
      if(v===ca) o.classList.add('correct');
      if(v===ua && v!==ca) o.classList.add('wrong');
    });
    if(ua===ca){card.classList.add('answered-correct');score+=points[i];correct++;}
    else{card.classList.add('answered-wrong');wrong++;}
    document.getElementById('comment-'+i).classList.add('show');
  }

  for (let i=21;i<=30;i++) {
    const card=document.getElementById('q'+i);
    const inp=document.querySelector('[data-q="'+i+'"].text-answer');
    const ua=userAnswers[i]||'';
    const ca=textAnswers[i];
    inp.disabled=true;
    if(norm(ua)===norm(ca)){
      inp.classList.add('correct-input');card.classList.add('answered-correct');
      score+=points[i];correct++;
    }else{
      inp.classList.add('wrong-input');card.classList.add('answered-wrong');wrong++;
    }
    document.getElementById('comment-'+i).classList.add('show');
  }

  const totalMax = 50.0;
  document.getElementById('check-btn').style.display='none';

  const rs=document.getElementById('result-section');
  rs.style.display='block';
  document.getElementById('final-score').textContent=score.toFixed(1)+' / '+totalMax.toFixed(1);
  document.getElementById('r-correct').textContent=correct;
  document.getElementById('r-wrong').textContent=wrong;
  const pct=((score/totalMax)*100).toFixed(0);
  document.getElementById('r-percent').textContent=pct+'%';
  document.getElementById('progress-fill').style.width=pct+'%';

  let msg='';
  if(pct>=90) msg='Ajoyib natija! Siz haqiqiy chempionsiz!';
  else if(pct>=70) msg='Yaxshi natija! Davom eting!';
  else if(pct>=50) msg="O'rtacha natija. Ko'proq mashq qiling!";
  else msg="Ko'proq o'rganing va qayta urinib ko'ring!";
  document.getElementById('result-msg').textContent=msg;

  rs.scrollIntoView({behavior:'smooth'});

  const user=getUser();
  if(user){
    const part1score=calcPartScore(1,10,answers);
    const part2score=calcPartScore(11,20,answers);
    const part3score=calcPartScore(21,30,textAnswers);
    apiPost('/api/scores',{
      part1:part1score,part2:part2score,part3:part3score,total:score,answers:userAnswers
    });
  }
}

function calcPartScore(start,end,ansMap){
  let s=0;
  for(let i=start;i<=end;i++){
    const ua=userAnswers[i]||'';
    const ca=ansMap[i]||'';
    if(norm(ua)===norm(ca)) s+=points[i];
  }
  return Math.round(s*10)/10;
}
