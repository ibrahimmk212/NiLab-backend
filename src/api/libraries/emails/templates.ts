import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

// Function to read a file's content
const readTemplateFile = (fileName: string): string => {
    const filePath = path.join(__dirname, 'templates', `${fileName}.hbs`);
    return fs.readFileSync(filePath, 'utf8');
};

// Register partials
handlebars.registerPartial('header', readTemplateFile('header'));
handlebars.registerPartial('footer', readTemplateFile('footer'));

const compileTemplate = (templateName: string) => {
    const templateSource = readTemplateFile(templateName);
    return handlebars.compile(templateSource);
};

export const getTemplate = (templateName: string) => {
    return compileTemplate(templateName);
};
