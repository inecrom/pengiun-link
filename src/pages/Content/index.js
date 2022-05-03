import * as tldts from './modules/tldts';
import stringSimilarity from 'string-similarity';

/*
let latest_result = {};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("message", message,"sender",sender);
  
    if(message == "getScores")  
    {  
        scoreSite().then(rs => { 
            console.log("responses",rs);
            sendResponse(latest_result);
        });
    }
    return true;
});
*/

const scoreSite = async () => {
    const options = await chrome.storage.local.get("options");
        const dom = tldts.getDomain(window.location.href);
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
            //chrome.runtime.sendMessage('',{ type:'setBadge', text:'⌛', color:[200, 200, 200, 100]});
            for(var i=0;i<rs.length;i++) {
                console.log(rs[i], rs[i].sim, options.options.threshold)
                
                
                if( max_sin < 1.0 &&  (rs[i].sim > options.options.threshold && rs[i].sim < 1.0)) {
                    
                    chrome.runtime.sendMessage('',{ type:'setBadge', text:'⛔', color:'red'});

    
                    
                    chrome.runtime.sendMessage('', {
                        type: 'notification',
                        data: {
                            sim : rs[i].sim, 
                            dom: dom,
                            url: rs[i].url
                        },
                        options: {
                        title: 'Penguin check result',                  
                        message: 'Site '+dom+' higher than level '+ rs[i].sim +', becarefull.',
                        iconUrl: '/mstile-128x128.png',                    
                        type: 'basic' 
                        }
                    });                

                    break;
                }       
            }

            if(max_sin == 1.0) {
                chrome.runtime.sendMessage('',{ type:'setBadge', text:'✅', color:[75, 220, 75, 100]});
            }

            latest_result = {
                sim: max_sin,
                dom: dom,
                url: url
            };

            if(options.options.debug ) {
                chrome.runtime.sendMessage('', {
                    type: 'notification',
                    data: {
                        sim : max_sin, 
                        dom: dom,
                    },
                    options: {                          
                    title: 'Penguin debug result',
                    message: 'Site '+dom+' (debug) maximum closure '+ max_sin,
                    iconUrl: '/mstile-128x128.png',
                    type: 'basic'
                    }
                });
            }            
        } else console.error("allowed sites seems empty!")
    
}

//scoreSite().then(a => console.log("ok",a) );