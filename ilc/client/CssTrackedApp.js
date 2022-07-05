export class CssTrackedApp {
    #originalApp;
    #cssLinkUri;
    #delayCssRemoval;

    parcels;
    static linkUsagesAttribute = 'data-ilc-usages';
    static markedForRemovalAttribute = 'data-ilc-remove';

    /**
     * @param {{unmount?: () => Promise, update: () => Promise, bootstrap: () => Promise, mount: () => Promise, parcels?: any}} originalApp
     * @param {string} cssLink
     * @param {Boolean} delayCssRemoval
     */
    constructor(originalApp, cssLink, delayCssRemoval) {
        this.#originalApp = originalApp;
        // this assumes that we always have 1 link to CSS from one application
        // real life might differ at some time
        this.#cssLinkUri = cssLink;
        this.#delayCssRemoval = delayCssRemoval;
        this.parcels = originalApp.parcels;
    }

    bootstrap = async (...args) => {
        return this.#originalApp.bootstrap(...args);
    }

    mount = async (...args) => {
        const link = this.#findLink();
        if (link === null) {
            await this.#appendCssLink();
        } else {
            const numberOfUsages = this.#getNumberOfLinkUsages(link);
            link.setAttribute(CssTrackedApp.linkUsagesAttribute, (numberOfUsages + 1).toString());
        }

        return await this.#originalApp.mount(...args);
    }

    unmount = async (...args) => {
        try {
            return this.#originalApp.unmount(...args);
        } finally {
            const link = this.#findLink();
            if (link != null) {
                this.#decrementOrRemoveCssUsages(link);
            }
        }
    }

    update = async (...args) => {
        if (!this.#originalApp.update) {
            return undefined;
        }

        return this.#originalApp.update(...args);
    }

    static removeAllNodesPendingRemoval() {
        const allNodes = document.querySelectorAll(`link[${CssTrackedApp.markedForRemovalAttribute}]`);
        Array.from(allNodes).forEach(node => node.remove());
    }

    #appendCssLink() {
        return new Promise((resolve, reject) => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = this.#cssLinkUri;
            newLink.setAttribute(CssTrackedApp.linkUsagesAttribute, '1');
            newLink.onload = () => resolve();
            newLink.onerror = () => reject();
            document.head.appendChild(newLink);
        });
    }

    #decrementOrRemoveCssUsages(link) {
        const numberOfUsages = this.#getNumberOfLinkUsages(link);
        if (numberOfUsages <= 1) {
            if (this.#delayCssRemoval) {
                link.removeAttribute(CssTrackedApp.linkUsagesAttribute);
                link.setAttribute(CssTrackedApp.markedForRemovalAttribute, 'true');
            } else {
                link.remove();
            }
        } else {
            link.setAttribute(CssTrackedApp.linkUsagesAttribute, (numberOfUsages - 1).toString());
        }
    }

    #getNumberOfLinkUsages(link) {
        const existingValue = link.getAttribute(CssTrackedApp.linkUsagesAttribute);
        return existingValue === null ? 0 : parseInt(existingValue, 10);
    }

    #findLink() {
        return document.querySelector(`link[href="${this.#cssLinkUri}"]`);
    }
}
