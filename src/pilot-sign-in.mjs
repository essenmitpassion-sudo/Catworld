import {m,setText} from './i18n.mjs';
import {createPilotSession} from './pilot-session.mjs';

const messages={
  'invalid-email':'Prüfe deine E-Mail-Adresse.',
  'invalid-code':'Gib den sechsstelligen Code ein.',
  'code-rejected':'Der Code ist falsch oder abgelaufen. Versuche es erneut oder fordere einen neuen Code an.',
  'request-rejected':'Die Codeanfrage wurde abgelehnt. Prüfe deine Einladung und versuche es erneut.',
  busy:'Warte kurz, bevor du es erneut versuchst.',
  timeout:'Die Anmeldung hat zu lange gedauert. Versuche es erneut.',
  unavailable:'Die Anmeldung ist gerade nicht erreichbar. Versuche es erneut.',
};

export function configuredPilotSession(document,platform) {
  if(!['android','ios'].includes(platform))return null;
  const profile=document.querySelector('meta[name="udi-native-pilot"]');
  return profile?createPilotSession(profile.dataset):null;
}

export function bindPilotSignIn({dialog,openButton,searchButton,session,onSignOut,onSessionChange,beforeOpen}) {
  const emailForm=dialog.querySelector('[data-pilot-email]');
  const codeForm=dialog.querySelector('[data-pilot-code]');
  const email=emailForm.elements.email;
  const code=codeForm.elements.code;
  const resend=dialog.querySelector('[data-pilot-resend]');
  const status=dialog.querySelector('[role="status"]');
  const introduction=dialog.querySelector('[data-pilot-intro]');
  const controls=[email,code,resend,emailForm.querySelector('[type="submit"]'),codeForm.querySelector('[type="submit"]')];
  let operation,opening=false;
  let returnFocus;

  function updateButton() {
    const signedIn=session.isSignedIn();
    setText(openButton,m(signedIn?'Abmelden':'Anmelden'));
    onSessionChange(signedIn);
  }
  async function open(anchor=openButton) {
    if(dialog.open||opening)return;
    opening=true;
    let ready;
    try {ready=await beforeOpen();}
    finally {opening=false;}
    if(!ready)return;
    returnFocus=anchor;
    emailForm.hidden=false;
    codeForm.hidden=true;
    introduction.hidden=false;
    email.value='';
    code.value='';
    setText(status,'');
    dialog.showModal();
    email.focus();
  }
  function close(anchor=returnFocus) {
    const current=operation;
    operation=null;
    current?.abort();
    for(const control of controls)control.disabled=false;
    if(!session.isSignedIn())session.signOut();
    dialog.close();
    email.value='';
    code.value='';
    anchor?.focus();
  }
  async function run(action) {
    if(operation)return;
    const request=new AbortController();
    operation=request;
    const address=email.value;
    const token=code.value;
    for(const control of controls)control.disabled=true;
    setText(status,m(action==='verify'?'Code wird geprüft …':'Code wird angefordert …'));
    let answer;
    try {
      answer=action==='verify'?await session.verifyCode(token,{signal:request.signal}):await session.requestCode(address,{signal:request.signal});
    } catch {
      answer={kind:'unavailable'};
    }
    if(operation!==request)return;
    operation=null;
    for(const control of controls)control.disabled=false;
    if(answer.kind==='signed-in') {
      close(searchButton);
      updateButton();
    } else if(answer.kind==='code-requested') {
      emailForm.hidden=true;
      codeForm.hidden=false;
      introduction.hidden=true;
      code.value='';
      code.focus();
      setText(status,m('Wenn deine E-Mail-Adresse für den Test freigeschaltet ist, erhältst du einen Code.'));
    } else {
      setText(status,m(messages[answer.kind]??messages.unavailable));
      (codeForm.hidden?email:code).focus();
    }
  }
  openButton.hidden=false;
  updateButton();
  openButton.addEventListener('click',()=>{
    if(!session.isSignedIn())return open();
    session.signOut();
    updateButton();
    onSignOut();
  });
  dialog.querySelector('[data-pilot-close]').addEventListener('click',()=>close());
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  emailForm.addEventListener('submit',event=>{event.preventDefault();void run('request');});
  codeForm.addEventListener('submit',event=>{event.preventDefault();void run('verify');});
  resend.addEventListener('click',()=>void run('request'));
  return {open,updateButton};
}
