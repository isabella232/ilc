import {
    Request,
    Response,
} from 'express';

import db from '../../db';
import validateRequestFactory from '../../common/services/validateRequest';
import Template, {
    LocalizedTemplate,
    templateSchema,
} from '../interfaces';
import { tables } from '../../db/structure';
import { readTemplateWithAllVersions } from '../services/templatesRepository';

const validateRequestBeforeCreateTemplate = validateRequestFactory([{
    schema: templateSchema,
    selector: 'body',
}]);

const createTemplate = async (req: Request, res: Response): Promise<void> => {
    const request = req.body;
    const template: Template = {
        name: request.name,
        content: request.content
    }

    await db.versioning(req.user, {type: 'templates', id: template.name}, async (trx) => {
        await db('templates').insert(template).transacting(trx);
    });

    const locales = Object.keys(request.localizedVersions || {});
    if (locales.length > 0) {
        await insertLocalizedVersions(locales, template, request);
    }

    const savedTemplate = await readTemplateWithAllVersions(template.name);
    res.status(200).send(savedTemplate);
};

function insertLocalizedVersions(locales: string[], template: Template, request: Record<string, any>) {
    return Promise.all(locales.map(locale => {
        const localizedTemplate: LocalizedTemplate = {
            templateName: template.name,
            content: request.localizedVersions[locale].content,
            locale: locale
        }

        return db(tables.templatesLocalized).insert(localizedTemplate);
    }));
}

export default [validateRequestBeforeCreateTemplate, createTemplate];
