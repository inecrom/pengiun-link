import { createChromeStorageStateHookLocal } from './useChromeStorageEx';


const SETTINGS_KEY = 'options';
const INITIAL_VALUE = {
    debugValue:'',
    debug: false,
    threshold:0.9,
    allowedSites: []
} as ISettings;

export interface ISettings {
    debugValue: string,
    debug:boolean,
    threshold: number,
    allowedSites: string[]
}

export const useSettingsStore = createChromeStorageStateHookLocal<ISettings>(SETTINGS_KEY, INITIAL_VALUE);