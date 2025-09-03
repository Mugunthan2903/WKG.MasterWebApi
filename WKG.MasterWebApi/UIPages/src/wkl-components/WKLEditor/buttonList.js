export const basic = [
    ["font", "fontSize"],
    ["fontColor"],
    ["horizontalRule"],
    ["link", "image"],
];

export const complex = [
    ["undo", "redo"],
    ["font", "fontSize", "formatBlock"],
    ["bold", "underline", "italic", "strike", "subscript", "superscript"],
    ["removeFormat"],
    "/",
    ["fontColor", "hiliteColor"],
    ["outdent", "indent"],
    ["align", "horizontalRule", "list", "table"],
    ["link", "image", "video"],
    ["fullScreen", "showBlocks", "codeView"],
    ["preview", "print"],
    ["save", "template"],
];

export const formatting = [
    ["undo", "redo"],
    ["bold", "underline", "italic", "strike", "subscript", "superscript"],
    ["removeFormat"],
    ["outdent", "indent"],
    ["fullScreen", "showBlocks", "codeView"],
    ["preview", "print"],
];

// export const customFormatting = [
//     ["undo", "redo"],
//     ['font', 'fontSize', 'formatBlock'],
//     ['paragraphStyle', 'blockquote'],
//     ["bold", "underline", "italic", "strike", 'fontColor', 'hiliteColor', 'align', 'list'],
//     ["outdent", "indent"],
//     ['table', 'link', 'image'],
//     ['imageGallery'],
//     ['preview', 'print'],
//     ['save', 'template'],
//     ["removeFormat"]

// ];

export const customFormatting = [
    ["undo", "redo"],
    ['font', 'fontSize', 'formatBlock'],
    ['paragraphStyle', 'blockquote'],
    ["bold", "underline", "italic", "strike", 'fontColor', 'hiliteColor', 'align', 'list'],
    ["outdent", "indent"],
    ['table', 'link'],
    ["removeFormat"]

];

export const completeFormatting = [
    // default
    ['undo', 'redo'],
    ['font', 'fontSize', 'formatBlock'],
    ['paragraphStyle', 'blockquote'],
    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
    ['fontColor', 'hiliteColor', 'textStyle'],
    ['removeFormat'],
    ['outdent', 'indent'],
    ['align', 'horizontalRule', 'list', 'lineHeight'],
    ['table', 'link', 'image', 'video', 'audio'/*, 'math'*/],
    ['imageGallery'],
    ['fullScreen', 'showBlocks', 'codeView'],
    ['preview', 'print'],
    ['save', 'template'],
    // (min-width: 1546)
    ['%1546', [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video', 'audio'/*, 'math'*/],
        ['imageGallery'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['-right', ':i-More Misc-default.more_vertical', 'preview', 'print', 'save', 'template']
    ]],
    // (min-width: 1455)
    ['%1455', [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video', 'audio'/*, 'math'*/],
        ['imageGallery'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template']
    ]],
    // (min-width: 1326)
    ['%1326', [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template'],
        ['-right', ':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'/*, 'math'*/, 'imageGallery']
    ]],
    // (min-width: 1123)
    ['%1123', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template'],
        ['-right', ':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'/*, 'math'*/, 'imageGallery']
    ]],
    // (min-width: 817)
    ['%817', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike'],
        [':t-More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template'],
        ['-right', ':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'/*, 'math'*/, 'imageGallery']
    ]],
    // (min-width: 673)
    ['%673', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'/*, 'math'*/, 'imageGallery'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template']
    ]],
    // (min-width: 525)
    ['%525', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        [':e-More Line-default.more_horizontal', 'align', 'horizontalRule', 'list', 'lineHeight'],
        [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'/*, 'math'*/, 'imageGallery'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template']
    ]],
    // (min-width: 420)
    ['%420', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle', 'removeFormat'],
        [':e-More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'lineHeight'],
        [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'/*, 'math'*/, 'imageGallery'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template']
    ]]
];