
const getLanguage = (lang) => {
    switch (typeof lang) {
        case "object":
            return lang;
            break;
        case "string":
            return require(`./src/lang/${lang}.js`);
            break;
        default:
            return undefined;
            break;
    }
};

export default getLanguage;