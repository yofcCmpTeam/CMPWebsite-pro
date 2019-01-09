import { Injectable } from '@angular/core';
// import { AES, enc } from 'crypto-js';

import { has, isNull, isUndefined, isNaN, each } from 'lodash';
// 引入加密库
const CryptoJS = require('crypto-js');

@Injectable()
export class SessionService {

    private json: Object = {};
    private tobeLocalSavedJson: Object = {};
    private tobeSessionSavedJson: Object = {};
    private timeoutId: any;

    /**
     * 得到session的值
     * @param string key
     * @returns any
     */
    public get(key: string): any {
        // console.debug('begin get(),key is %s', key);
        if (has(this.json, key)) {
            try {
                const valueStr = sessionStorage.getItem(key) || localStorage.getItem(key);
                if (valueStr) {
                    this.json[key] = JSON.parse(CryptoJS.AES.decrypt(valueStr, key)
                        .toString(CryptoJS.enc.Utf8));
                }
            } catch (e) {
                console.error(`localStorage access denied!`);
                return null;
            }
            return this.json[key];
        }
    }

    /**
     * 添加session
     *
     * @param string key
     * @param value any
     * @param boolean isPersistence
     */
    public put(key: string, value: any, isPersistence?: boolean): void {
        isPersistence = isPersistence || false;
        if (isNull(value) || isUndefined(value) || isNaN(value)) {
            this.remove(key);
            return;
        }
        this.json[key] = value;
        if (isPersistence) {
            this.tobeLocalSavedJson[key] = value;
        } else {
            this.tobeSessionSavedJson[key] = value;
        }
        try {
            this._delaySave();
        } catch (e) {
            console.error(`localStorage access denied!`);
        }
    }

    /**
     * 清除所有session
     * @param boolean isAlsoClearPersistent
     */
    public clear(isAlsoClearPersistent?: boolean) {
        this.json = {};
        try {
            sessionStorage.clear();
        } catch (e) {
            console.error(`localStorage access denied!`);
        }
        if (isAlsoClearPersistent) {
            try {
                localStorage.clear();
            } catch (e) {
                console.error(`localStorage access denied!`);
            }
        }
        this.tobeLocalSavedJson = {};
        this.tobeSessionSavedJson = {};
    }

    /**
     * 移除对应key的session
     * @param string key
     */
    public remove(key: string) {
        delete this.json[key];
        delete this.tobeSessionSavedJson[key];
        delete  this.tobeLocalSavedJson[key];

        try {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`localStorage access denied!`);
        }
    }

    private _delaySave(): void {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            try {
                this.saveToStorge(this.tobeLocalSavedJson, localStorage);
                this.saveToStorge(this.tobeSessionSavedJson, sessionStorage);
                this.tobeLocalSavedJson = {};
                this.tobeSessionSavedJson = {};
            } catch (e) {
                console.error(`localStorage access denied!`);
            }
        }, 30);
    }

    private saveToStorge(json, storge) {
        each(json, (value: any, key: any) => {
            const encryptValue = CryptoJS.AES.encrypt(JSON.stringify(value), key);
            try {
                storge.setItem(key, encryptValue);
            } catch (e) {
                console.error(`localStorage access denied!`);
            }
        });

    }
}
