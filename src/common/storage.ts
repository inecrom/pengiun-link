export const storage = {
    get: (key:string, defaultValue:any, storageArea:string) => {
        const keyObj = defaultValue === undefined ? key : {[key]: defaultValue};
        return new Promise((resolve, reject) => {
            
            let str = undefined;
            if(storageArea=="local")
                str = chrome.storage.local;
            else str = chrome.storage.sync;

            str.get(keyObj, (items:any) => {
                const error = chrome.runtime.lastError;
                if (error) return reject(error);
                resolve(items[key]);
            });
        });
    },
    set: (key:string, value:any, storageArea:string) => {
        return new Promise<void>((resolve, reject) => {

            let str = undefined;
            if(storageArea=="local")
                str = chrome.storage.local;
            else str = chrome.storage.sync;
            str.set({[key]: value}, () => {
                const error = chrome.runtime.lastError;
                error ? reject(error) : resolve();
            });
        });
    },
};