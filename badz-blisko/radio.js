/* Bądź Blisko: accessible control for the canonical radio; no second audio or counter. */
(()=>{'use strict';function init(){if(document.getElementById('bliskoRadioToggle'))return;
const mini=document.getElementById('luminaMiniPlayerContainer');if(mini)mini.style.setProperty('display','none','important');
const locale=document.documentElement.lang;
const messages={pl:['Łączenie z radiem…','Radio nie ruszyło. Spróbuj ponownie.'],en:['Connecting to radio…','Radio did not start. Try again.'],es:['Conectando con la radio…','La radio no se inició. Inténtalo de nuevo.'],pt:['Conectando ao rádio…','O rádio não iniciou. Tente novamente.'],fr:['Connexion à la radio…','La radio n’a pas démarré. Réessayez.'],ar:['جارٍ الاتصال بالراديو…','لم يبدأ الراديو. حاول مجددًا.'],hi:['रेडियो से जुड़ रहा है…','रेडियो शुरू नहीं हुआ। फिर कोशिश करें।'],id:['Menghubungkan radio…','Radio belum mulai. Coba lagi.']}[locale]||['Connecting…','Try again.'];
const labels=window.CCPageI18n?.labels||{radioPlay:'Play Radio CC',radioStop:'Stop Radio CC'};
const button=document.createElement('button');button.id='bliskoRadioToggle';button.type='button';
const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('width','24');icon.setAttribute('height','24');icon.setAttribute('aria-hidden','true');const path=document.createElementNS(icon.namespaceURI,'path');icon.append(path);button.append(icon);
const status=document.createElement('span');status.id='bliskoRadioStatus';status.setAttribute('role','status');status.className='blisko-radio-status';document.body.append(button,status);
let audio=null,pending=false,timer;
function state(value){const playing=value==='playing';pending=value==='loading';const label=pending?messages[0]:value==='error'?messages[1]:playing?labels.radioStop:labels.radioPlay;button.title=label;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(playing));button.dataset.state=value;path.setAttribute('d',pending?'M4 10h3v4H4zm7 0h3v4h-3zm7 0h3v4h-3z':playing?'M6 6h12v12H6z':'M7 4l14 8-14 8z');status.textContent=(pending||value==='error')?label:'';}
function attach(){const element=document.getElementById('luminaGlobalAudio');if(!element||element===audio)return;audio=element;for(const name of ['playing','pause','waiting','error','ended'])audio.addEventListener(name,()=>{if(name==='playing'){clearTimeout(timer);state('playing')}else if(name==='waiting'){state('loading')}else{clearTimeout(timer);state(name==='error'?'error':'paused')}})}
button.addEventListener('click',event=>{const api=window.LuminaMiniPlayer;if(!api){state('error');return}attach();if(pending||(audio&&!audio.paused)){clearTimeout(timer);api.pause();state('paused');return}state('loading');api.play();attach();timer=setTimeout(()=>{if(!audio||audio.readyState<3||audio.paused)state('error')},20000)});
attach();state(audio&&!audio.paused&&audio.readyState>=3?'playing':'paused');
const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true});
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()})();
