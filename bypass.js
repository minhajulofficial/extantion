/****
 * Photoroom Extension - License & Credit Bypass Script
 * 
 * This script removes all restrictions:
 * - License validation
 * - Credit limits
 * - User authentication
 * - Pro/premium checks
 * 
 * Usage: Include this file before the main extension scripts
 ****/

(function() {
    'use strict';
    
    console.log('[Bypass] Initializing license and credit bypass...');
    
    // Flag to track if we're in "free mode"
    window.__PHOTOROOM_BYPASS__ = true;
    
    // ==========================================
    // BYPASS 1: License System
    // ==========================================
    
    // Override license checking functions
    window.checkLicense = function() {
        console.log('[Bypass] License check called - returning valid');
        return { valid: true, active: true, type: 'pro', expiry: null };
    };
    
    window.validateLicense = function() {
        console.log('[Bypass] License validation called - returning valid');
        return true;
    };
    
    window.verifyLicense = function() {
        console.log('[Bypass] License verification called - returning valid');
        return true;
    };
    
    // ==========================================
    // BYPASS 2: Credit System
    // ==========================================
    
    // Set unlimited credits
    window.__CREDITS__ = {
        remaining: Infinity,
        total: Infinity,
        unlimited: true
    };
    
    window.getCredits = function() {
        console.log('[Bypass] getCredits called - returning unlimited');
        return Infinity;
    };
    
    window.checkCredits = function(amount) {
        console.log('[Bypass] checkCredits called - returning unlimited');
        return true;
    };
    
    window.useCredits = function(amount) {
        console.log('[Bypass] useCredits called - allowing action');
        return true;
    };
    
    window.hasCredits = function(amount) {
        console.log('[Bypass] hasCredits called - returning true');
        return true;
    };
    
    // ==========================================
    // BYPASS 3: Pro/Premium Checks
    // ==========================================
    
    window.__IS_PRO__ = true;
    window.__IS_PREMIUM__ = true;
    window.__USER_TIER__ = 'pro';
    
    window.isPro = function() {
        console.log('[Bypass] isPro called - returning true');
        return true;
    };
    
    window.isPremium = function() {
        console.log('[Bypass] isPremium called - returning true');
        return true;
    };
    
    window.hasProAccess = function() {
        console.log('[Bypass] hasProAccess called - returning true');
        return true;
    };
    
    // ==========================================
    // BYPASS 4: User Authentication
    // ==========================================
    
    window.__USER__ = {
        id: 'bypass-user',
        email: 'free@photoroom.local',
        isLoggedIn: true,
        isAdmin: true,
        tier: 'pro',
        credits: Infinity
    };
    
    window.getUser = function() {
        console.log('[Bypass] getUser called - returning admin user');
        return window.__USER__;
    };
    
    window.isLoggedIn = function() {
        console.log('[Bypass] isLoggedIn called - returning true');
        return true;
    };
    
    window.checkAuth = function() {
        console.log('[Bypass] checkAuth called - returning true');
        return true;
    };
    
    // ==========================================
    // BYPASS 5: Limit/Restriction Checks
    // ==========================================
    
    window.isLimitExceeded = function() {
        console.log('[Bypass] isLimitExceeded called - returning false');
        return false;
    };
    
    window.checkLimit = function() {
        console.log('[Bypass] checkLimit called - returning false');
        return false;
    };
    
    window.hasReachedLimit = function() {
        console.log('[Bypass] hasReachedLimit called - returning false');
        return false;
    };
    
    // ==========================================
    // BYPASS 6: Feature Flags
    // ==========================================
    
    window.__FEATURES__ = {
        pro: true,
        backgroundRemoval: true,
        bulkDownload: true,
        hdExport: true,
        apiAccess: true,
        unlimited: true
    };
    
    window.canUseFeature = function(feature) {
        console.log('[Bypass] canUseFeature called for', feature, '- returning true');
        return true;
    };
    
    window.hasFeature = function(feature) {
        console.log('[Bypass] hasFeature called for', feature, '- returning true');
        return true;
    };
    
    // ==========================================
    // BYPASS 7: Storage Overrides
    // ==========================================
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
        const originalStorageGet = chrome.storage.local.get;
        chrome.storage.local.get = function(keys, callback) {
            if (typeof keys === 'string') {
                keys = [keys];
            }
            if (Array.isArray(keys)) {
                const filteredKeys = keys.filter(k => 
                    !k.toLowerCase().includes('license') && 
                    !k.toLowerCase().includes('licence') &&
                    !k.toLowerCase().includes('subscription') &&
                    !k.toLowerCase().includes('pro') &&
                    !k.toLowerCase().includes('credit')
                );
                if (filteredKeys.length > 0) {
                    return originalStorageGet.call(chrome.storage.local, filteredKeys, callback);
                }
                if (callback) {
                    callback({});
                }
                return Promise.resolve({});
            }
            return originalStorageGet.call(chrome.storage.local, keys, callback);
        };
    }
    
    console.log('[Bypass] All bypasses applied successfully!');
    console.log('[Bypass] Extension is now running in FREE mode with unlimited access.');
    
})();
