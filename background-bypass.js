/****
 * Background Service Worker - License & Credit Bypass
 * Runs in background to ensure all restrictions are bypassed
 ****/

(function() {
    'use strict';
    
    console.log('[Background Bypass] Initializing...');
    
    // Apply all bypasses to global scope
    window.__PHOTOROOM_BYPASS__ = true;
    
    // License bypass
    window.checkLicense = () => ({ valid: true, active: true, type: 'pro' });
    window.validateLicense = () => true;
    window.verifyLicense = () => true;
    
    // Credits bypass
    window.__CREDITS__ = { remaining: Infinity, total: Infinity, unlimited: true };
    window.getCredits = () => Infinity;
    window.checkCredits = () => true;
    window.useCredits = () => true;
    window.hasCredits = () => true;
    
    // Pro bypass
    window.__IS_PRO__ = true;
    window.__IS_PREMIUM__ = true;
    window.__USER_TIER__ = 'pro';
    window.isPro = () => true;
    window.isPremium = () => true;
    window.hasProAccess = () => true;
    
    // User bypass
    window.__USER__ = {
        id: 'free-user',
        email: 'free@photoroom.local',
        isLoggedIn: true,
        tier: 'pro',
        credits: Infinity
    };
    window.getUser = () => window.__USER__;
    window.isLoggedIn = () => true;
    window.checkAuth = () => true;
    
    // Limit bypass
    window.isLimitExceeded = () => false;
    window.checkLimit = () => false;
    window.hasReachedLimit = () => false;
    
    // Feature bypass
    window.__FEATURES__ = {
        pro: true,
        backgroundRemoval: true,
        bulkDownload: true,
        hdExport: true,
        unlimited: true
    };
    window.canUseFeature = () => true;
    window.hasFeature = () => true;
    
    // Intercept storage API for license/credit data
    const originalGet = chrome.storage.local.get;
    chrome.storage.local.get = function(keys, callback) {
        if (typeof keys === 'string') keys = [keys];
        if (Array.isArray(keys)) {
            const filtered = keys.filter(k => 
                !k.toLowerCase().includes('license') &&
                !k.toLowerCase().includes('credit') &&
                !k.toLowerCase().includes('subscription') &&
                !k.toLowerCase().includes('pro')
            );
            if (filtered.length > 0) {
                return originalGet.call(chrome.storage.local, filtered, callback);
            }
            if (callback) callback({});
            return Promise.resolve({});
        }
        return originalGet.call(chrome.storage.local, keys, callback);
    };
    
    // Intercept messages and always respond with valid/pro status
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'licenseCheck' || 
            message.type === 'creditCheck' ||
            message.type === 'proCheck' ||
            message.type === 'authCheck') {
            sendResponse({ success: true, valid: true, tier: 'pro', credits: Infinity });
            return true;
        }
    });
    
    console.log('[Background Bypass] All restrictions bypassed!');
})();
