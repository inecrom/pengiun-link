import * as tldts from './modules/tldts';
import stringSimilarity from 'string-similarity';


const db = {};

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
  });

 

  const scoreSite = async (tabid, qurl) => {
    const options = await chrome.storage.local.get("options");
      if(qurl.indexOf("chrome")===0) return ;
        const dom = tldts.getDomain(qurl);
        if(options.options.allowedSites) {
            var rs = options.options.allowedSites.map((sSite,idx) => {            
                return {
                    sim: stringSimilarity.compareTwoStrings(dom, sSite).toFixed(3),
                    url: sSite,
                    index: idx
                }
            });        
            let max_sin = 0;
            let url ="";
            
            for(var i=0;i<rs.length;i++) {
                if(max_sin<rs[i].sim) { 
                    max_sin = rs[i].sim;
                    url = rs[i].url
                }
            }

            chrome.action.setIcon({ tabId: tabid, path:'/icons8-query-48.png' });

            for(var i=0;i<rs.length;i++) {
                console.log("max_sin",max_sin, "sim", rs[i].sim, "thr", options.options.threshold);
                
                
                if( max_sin < 1.0 &&  (rs[i].sim > options.options.threshold && rs[i].sim < 1.0)) {
                    console.warn("notification - show");
                    chrome.action.setIcon({ tabId: tabid, path:'/icons8-warning-shield-48.png' });
                    chrome.notifications.create('',  {
                      title: 'Penguin check result',                  
                      message: 'Site '+dom+' higher than level '+ rs[i].sim +', becarefull.',
                      iconUrl: '/mstile-128x128.png',                    
                      type: 'basic' 
                      });
                    break;
                }       
            }

            if(max_sin == 1.0) {                
                chrome.action.setIcon({ tabId: tabid, path:'/icons8-protect-48.png' });
            }

            db[dom] = {
                sim: max_sin,
                dom: dom,
                url: url
            };

            if(options.options.debug ) {

              chrome.notifications.create('',  {                          
                title: 'Penguin debug result',
                message: 'Site '+dom+' (debug) maximum closure '+ max_sin,
                iconUrl: '/mstile-128x128.png',
                
                type: 'basic'
                });
                
            }            
        } else console.error("allowed sites seems empty!")
    
}

chrome.tabs.onUpdated.addListener( (tabId, ci, tab) => { 
    
    console.log(tabId, ci, tab);

    if(tab.active === true) {
      if(tab.status === "complete") {
        
            console.log("tab", tab);
            scoreSite(tab.id, tab.url);
      }
    }
  
});


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  
  if(message.type === "getScores")  
  {  

      scoreSite(message.id, message.url).then(function(){

        
        
      sendResponse(db[tldts.getDomain(message.url)]);
      });
    
  }
  return true;
});

chrome.tabs.onActivated.addListener( async (ti) =>{
   const tab= await chrome.tabs.get(ti.tabId);
   if(tab.active) {
     if(tab.status==="complete") {
      scoreSite(tab.id, tab.url);
     }
   }
});