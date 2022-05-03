import {useCallback, useEffect} from 'react';
import useChromeStorage from './useChromeStorage';


export default function createChromeStorageStateHook<T>(key:string, initialValue:T, storageArea:string) {
    const consumers: any[] = [];

    return function useCreateChromeStorageHook() {
        const [value, setValue, isPersistent, error] = useChromeStorage(key, initialValue, storageArea);

        const setValueAll = useCallback((newValue: any) => {
            for (const consumer of consumers) {
                consumer(newValue);
            }
        }, []);

        useEffect(() => {
            consumers.push(setValue);
            return () => {
                consumers.splice(consumers.indexOf(setValue), 1);
            };
        }, [setValue]);

        return [value, setValueAll, isPersistent, error];
    };
}