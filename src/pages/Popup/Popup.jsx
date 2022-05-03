import React from 'react';
import logo from '../../assets/img/penguin.svg';
import okay from '../../assets/okay.svg';
import danger from '../../assets/danger.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';
import {ISettings, useSettingsStore} from '../../common/useSettingsStore';


import * as tldts from './modules/tldts';

const Popup = () => {

  const [activeTab, setActiveTab] = React.useState({});
  const [scores, setScores] = React.useState({});

  const [buttonClicked, setButtonClicked] = React.useState(0);
  const [settings, setSettings, isPersistent, error] = useSettingsStore();

  React.useEffect( ()=> {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {      
      setActiveTab(tabs[0]);
      chrome.runtime.sendMessage('', { type:'getScores', id:tabs[0].id, url:tabs[0].url }, respon => {
        console.log("message response", respon);
        setScores(respon);
        let min_score;
        let max_score;
         for(var i=0;i<respon.length;i++) {
            if(!min_score) min_score = respon[i];
            if(!max_score) max_score = respon[i];

            
         }
      });      
    });
  },[buttonClicked]);

  const openOptions = () => {
    chrome.tabs.create({'url': "/options.html" } )
  }
  const domain_from_url = (url) => {
      var result
      var match
      if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
          result = match[1]
          if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
              result = match[1]
          }
      }
      return result;
  }
  const allowSite = () => {
    var ns = domain_from_url(tldts.getDomain(activeTab.url));
    
    if(ns && ns !="" && settings.allowedSites.indexOf(ns)==-1) {
      setSettings((p) =>{
       return {
        ...p,
        allowedSites: [...p.allowedSites, ns]
       } 
      });   
      setButtonClicked( buttonClicked + 1);
    }
  }
  const disallowSite = () => {
    var s = domain_from_url(tldts.getDomain(activeTab.url));
    
    setSettings((p) => {
      const ai = p.allowedSites.indexOf(s);
      
      if(ai>-1) {
        p.allowedSites.splice(ai,1);
        return {
          ...p, 
          allowedSites: [...p.allowedSites]
        }
      }
      return p;
      
    });
    setButtonClicked( buttonClicked + 1);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="watch">      
          Penguin is watching (O.o)
        </div>
        <div>
          <div><b>Domain:</b> {tldts.getDomain(activeTab.url)}</div>
          <div><b>Likely:</b> {scores && scores.sim}</div>
          <div><b>{scores && 'looks like: '+scores.url}</b></div>
          <div><button className="btn-pop" disabled={ !scores || scores.sim==1 }  onClick={e => allowSite()}>Add to Allowed Sites</button></div>
          <div><button className="btn-pop" disabled={ scores && scores.sim!=1 }  onClick={e => disallowSite()}>Remove from Allowed Sites</button></div>
          <div><button className="btn-pop" onClick={e => openOptions()}>Open Options</button></div>
        </div>
     
      <a style={{ 'position':'absolute', 'bottom':'0', 'fontSize':'11px', 'color':'white'}} rel="noreferrer" target="_blank" href="https://icons8.com/">
        Shield icons by Icons8</a>
        </header>
    </div>
  );
};

export default Popup;
