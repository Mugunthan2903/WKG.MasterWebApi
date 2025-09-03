import $ from 'jquery';

class textboxUtil {
    setCaretPosition(target, caretPos) {
        if (target != null) {
            if (target.createTextRange) {
                var range = target.createTextRange();
                range.move('character', caretPos);
                range.select();
            }
            else {
                if (target.selectionStart) {
                    target.focus();
                    target.setSelectionRange(caretPos, caretPos);
                }
                else
                    target.focus();
            }
        }
    };
    setNewText(target, data) {

        if ('selectionStart' in target) {
            // check whether some text is selected in the textarea
            var newText = target.value.substring(0, target.selectionStart) + data + target.value.substring(target.selectionEnd);
            target.value = newText;
        }
        else {  // Internet Explorer before version 9
            // create a range from the current selection
            var textRange = document.selection.createRange();
            // check whether the selection is within the textarea
            var rangeParent = textRange.parentelmnt();
            if (typeof rangeParent === "textarea") {
                textRange.text = data;
            }
        }
    }
    getSelection(target) {
        var s = { start: 0, end: 0 };
        if (typeof target.selectionStart === "number" && typeof target.selectionEnd === "number") {
            // Firefox (and others)
            s.start = target.selectionStart;
            s.end = target.selectionEnd;
        } else if (document.selection) {
            // IE
            var bookmark = document.selection.createRange().getBookmark();
            var sel = target.createTextRange();
            var bfr = sel.duplicate();
            sel.moveToBookmark(bookmark);
            bfr.setEndPoint("EndToStart", sel);
            s.start = bfr.text.length;
            s.end = s.start + sel.text.length;
        }
        return s;
    };

    convertToTitleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    };
    titleCasePasteInput(evt, text) {
        var target = evt.target;
        var value = evt.target.value;
        var s = this.getSelection(target);
        var length = s.end - s.start;
        let cap = true;
        let dataList = [];
        if (s.start === 0 || value.substr(s.start - 1, 1) === " " || length === value.length) {
            for (var idx in text) {
                let ch = text[idx];
                if (cap === true && ch !== ' ') {
                    dataList.push(ch.toUpperCase());
                    cap = false;
                }
                else
                    dataList.push(ch);

                if (ch === ' ')
                    cap = true;
                else
                    cap = false;
            }
            let newText = dataList.join('');
            this.setNewText(target, newText);
            this.setCaretPosition(target, s.start + text.length);
            evt.preventDefault();
            return target.value;
        }
        return null;
    };
    titleCaseInput(evt) {
        var target = evt.target;
        var value = evt.target.value;
        var s = this.getSelection(target);
        var length = s.end - s.start;
        if (s.start === 0 || value.substr(s.start - 1, 1) === " " || length === value.length) {
            var newText = String.fromCharCode(evt.keyCode || evt.charCode).toUpperCase();
            this.setNewText(target, newText);
            this.setCaretPosition(target, s.start + 1);
            evt.preventDefault();
        }

    };


    computeProposed(newText, text, s) {
        //var length = s.end - s.start;
        text = text.substring(0, s.start) + newText + text.substring(s.end);
        return text;
    };
    toSentenceCase(overrideText) {
        var rawText = overrideText;
        function indexOfAny(txt, anyOf /*Array*/, startIndex /*uint*/, count /*int*/) /*int*/ {
            startIndex = isNaN(startIndex) ? 0 : startIndex;
            if (startIndex < 0) {
                startIndex = 0;
            }

            count = isNaN(count) ? -1 : ((count >= 0) ? count : -1);

            if (anyOf != null && txt != null && txt !== "") {
                var i /*int*/;
                var l /*int*/ = anyOf.length;
                var endIndex /*int*/;
                if ((count < 0) || (count > l - startIndex)) {
                    endIndex = l - 1;
                }
                else {
                    endIndex = startIndex + count - 1;
                }
                for (i = startIndex; i <= endIndex; i++) {
                    var index = txt.indexOf(anyOf[i]);
                    if (index > -1) {
                        return index;
                    }
                }
            }
            return -1;
        };
        function capitaliseSentence(sentence) {
            var result = "";
            if ($.trim(sentence).length === 0)
                return sentence;

            while (sentence[0] === ' ') {
                sentence = sentence.substr(1);
                result += " ";
            }
            if (sentence.length > 0) {
                result += sentence.trimLeft().substring(0, 1).toUpperCase();
                result += sentence.trimLeft().substr(1);
            }
            return result;
        }
        function splitAtFirstSentence(text) {
            //these are the characters to start a new sentence after
            var lastChar = indexOfAny(text, ['.', ':', '\n', '!', '?']);
            if (lastChar === -1)
                lastChar = 0;
            else
                lastChar += 1;
            return [text.substring(0, lastChar), text.substr(lastChar)];
        }
        function sentenceCaseEx() {
            var text = rawText;
            if ($.trim(text).length === 0)
                return text;

            try {
                var temporary = text; //.ToLower();
                if (overrideText === true)
                    temporary = text.toLowerCase();

                var result = "";
                while (temporary.length > 0) {
                    var splitTemporary = splitAtFirstSentence(temporary);
                    temporary = splitTemporary.length > 1 ? splitTemporary[1] : "";
                    if (splitTemporary[0].length > 0) {
                        result += capitaliseSentence(splitTemporary[0]);
                    }
                    else {
                        result += capitaliseSentence(splitTemporary[1]);
                        temporary = "";
                    }
                }
                return result;
            }
            catch (ex) { }
            return text;
        }
        return sentenceCaseEx();
    }
    sentenceCasePasteInput(evt, text) {
        var target = evt.target;
        var value = evt.target.value;
        var s = this.getSelection(target);
        var newText = text;
        var data = this.computeProposed(newText, value, s);
        data = this.toSentenceCase(data);
        var startIndex = s.start;
        var tempData = data.substr(startIndex, text.length);
        if (newText !== tempData) {
            this.setNewText(target, tempData);
            this.setCaretPosition(target, s.start + text.length);
            evt.preventDefault();
            return target.value;
        }
        return null;
    };
    sentenceCaseInput(evt) {
        var target = evt.target;
        var value = evt.target.value;
        var s = this.getSelection(target);
        var newText = String.fromCharCode(evt.keyCode || evt.charCode);
        var data = this.computeProposed(newText, value, s);
        data = this.toSentenceCase(data);

        var startIndex = s.start;
        if (evt.keyCode === 13 || evt.charCode === 13) {

        }
        else {
            var tempData = data[startIndex];
            if (newText !== tempData) {
                this.setNewText(target, tempData);
                this.setCaretPosition(target, s.start + 1);
                evt.preventDefault();
            }
        }

    };
}

let TextboxUtil = new textboxUtil();
export { TextboxUtil };