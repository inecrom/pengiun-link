import {useCallback, useEffect, useState} from 'react';
import {storage} from './storage';


/**
 * Basic hook for storage
 * @param {string} key
 * @param {*} initialValue
 * @param {'local'|'sync'} storageArea
 * @returns {[*, function(*= any): void, boolean, string]}
 */
export default function useChromeStorage(key: string, initialValue:any, storageArea:string) {
    const [INITIAL_VALUE] = useState(() => {
        return typeof initialValue === 'function' ? initialValue() : initialValue;
    });
    const [STORAGE_AREA] = useState(storageArea);
    const [state, setState] = useState(INITIAL_VALUE);
    const [isPersistent, setIsPersistent] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        storage.get(key, INITIAL_VALUE, STORAGE_AREA)
            .then((res:any) => {
                setState(res);
                setIsPersistent(true);
                setError('');
            })
            .catch((error:any) => {
                setIsPersistent(false);
                setError(error);
            });
    }, [key, INITIAL_VALUE, STORAGE_AREA]);

    const updateValue = useCallback((newValue:any) => {
        const toStore = typeof newValue === 'function' ? newValue(state) : newValue;
        storage.set(key, toStore, STORAGE_AREA)
            .then(() => {
                setIsPersistent(true);
                setError('');
            })
            .catch((error:any) => {
                // set newValue to local state because chrome.storage.onChanged won't be fired in error case
                setState(toStore);
                setIsPersistent(false);
                setError(error);
            });
    }, [STORAGE_AREA, key, state]);

    useEffect(() => {
        const onChange = (changes:any, areaName:string) => {
            if (areaName === STORAGE_AREA && key in changes) {
                setState(changes[key].newValue);
                setIsPersistent(true);
                setError('');
            }
        };
        chrome.storage.onChanged.addListener(onChange);
        return () => {
            chrome.storage.onChanged.removeListener(onChange);
        };
    }, [key, STORAGE_AREA]);

    return [state, updateValue, isPersistent, error];
}