var translate = require('translation-google');

translate('This is Google Translate', {to: 'fa'}).then(res => {
    console.log(res.text);
    //=> 这是Google翻译
    console.log(res.from.language.iso);
    //=> en
}).catch(err => {
    console.error(err);
});