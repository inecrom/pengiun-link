import React from 'react';
import './Options.css';

import {ISettings, useSettingsStore} from '../../common/useSettingsStore';


interface Props {
  title: string;
}


const Options: React.FC<Props> = ({ title }: Props) => {

  
  const [settings, setSettings, isPersistent, error] = useSettingsStore();

  const [newSite, setNewSite] = React.useState("");

  const handleChange = (event:any) => {
  
      setSettings( (prevState:any) => {
          return {
              ...prevState,
              [event.target.name]: event.target.checked
          };
      });
  };

  const handleChange2 = (event:any) => {
  
    setSettings( (prevState:any) => {
        return {
            ...prevState,
            [event.target.name]: event.target.value
        };
    });
};

  const addNewSite = (event:any) => {

    var ns = domain_from_url(newSite);
    if(ns && ns !="" && settings.allowedSites.indexOf(ns)==-1) {
      setSettings((p:any) =>{
       return {
        ...p,
        allowedSites: [...p.allowedSites, ns]
       } 
      });   

    }
      
      setNewSite("");
  }

  const domain_from_url = (url:string) => {
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

  const removeSite = (s:string) => {
    console.log("removing site!");
    setSettings((p:any) => {
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
  }

  const rSettings = (settings as ISettings);

  return <>
          <div className="OptionsContainer">{title} Page</div>
          
          <div className="uk-container uk-margin">
            <form id="optionsForm" className="uk-form-stacked" onSubmit={e =>  e.preventDefault()}>   
                   
            <div className="uk-margin uk-child-auto-width uk-grid uk-grid-small">
                <label  htmlFor="debug">              
                <input className="uk-checkbox" checked={settings.debug}
                          onChange={handleChange}
                          type="checkbox" name="debug" id="debug" />                  
                {' '} Enable debug mode</label>
            </div>
            <div className='uk-margin'>
              <label>Current relavancy threshold: <b>{settings.threshold}</b></label>
              <input type="range" value={settings.threshold} name="threshold" onChange={handleChange2} min={0} max={1} step={0.01} className="uk-range" />
            </div>
            <div className="uk-margin">
                  <label className="uk-form-label"><strong>Add Site:</strong></label>
                  <div className="uk-form-controls uk-form-controls-text">
                    <input className='uk-input' type="text" pattern="^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$" value={newSite} onChange={e => {              
                      setNewSite(e.target.value); }} 
                      onKeyPress={e => { if(e.key=="Enter") addNewSite(e); } }
                      />
                  </div>              
            </div>
            <div className="row uk-margin">
              <div className="col-12">
                <label className="uk-form-label"><strong>Allowed Sites:</strong> <span className="uk-badge">{rSettings.allowedSites.length}</span></label>
                <ul className="uk-list uk-list-striped">
                {
                  rSettings.allowedSites.map( (a,b) => {
                    return <li key={a} className="uk-flex uk-flex-between">
                      <span className='uk-text-default uk-text-primary'>{a}</span>
                      
                      <button type='button' onClick={_e => window.confirm("Are you sure you want to delete '"+a+"' site?") && removeSite(a) } 
                      className="uk-button uk-button-danger uk-button-small">Remove</button>
                      </li>
                  })
                }
                </ul>
              </div>
            </div>     
              
            </form>
          </div>
        </>;
};

export default Options;
