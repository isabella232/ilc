const deepmerge = require('deepmerge');

function appIdToNameAndSlot(appId) {
    const [appNameWithoutPrefix, slotName] = appId.split('__at__');

    // Case for shared libraries
    if (appNameWithoutPrefix === undefined || slotName === undefined) {
        return {
            appName: appId,
            slotName: 'none',
        };
    }

    return {
        appName: `@portal/${appNameWithoutPrefix}`,
        slotName,
    };
}

function makeAppId(appName, slotName) {
    return `${appName.replace('@portal/', '')}__at__${slotName}`;
}

function cloneDeep(source) {
    return deepmerge({}, source);
}

const uniqueArray = (array) => [...new Set(array)];

const encodeHtmlEntities = (value) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decodeHtmlEntities = (value) =>
    value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');

const fakeBaseInCasesWhereUrlIsRelative = 'http://hack';
const parseUrl = (url) => new URL(url, fakeBaseInCasesWhereUrlIsRelative);

const removeQueryParams = (url) => {
    const index = url.indexOf('?');
    if (index !== -1) {
        return url.substring(0, index);
    } else {
        return url;
    }
};

const addTrailingSlash = (url) => {
    if (url.endsWith('/')) {
        return url;
    }

    return `${url}/`;
};

function addTrailingSlashToPath(url) {
    const isFullUrl = url.includes('://');
    const parsedUrl = isFullUrl ? new URL(url) : new URL(`https://example.com/${url}`);
    const hasTrailingSlash = parsedUrl.pathname.endsWith('/');
    const slash = hasTrailingSlash ? '' : '/';
    parsedUrl.pathname += slash;
    return isFullUrl ? parsedUrl.toString() : parsedUrl.pathname.slice(1);
}

module.exports = {
    appIdToNameAndSlot,
    makeAppId,
    cloneDeep,
    uniqueArray,
    encodeHtmlEntities,
    decodeHtmlEntities,
    parseUrl,
    removeQueryParams,
    addTrailingSlash,
    addTrailingSlashToPath,
};
