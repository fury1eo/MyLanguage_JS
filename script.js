'use strict';

const code = document.querySelector('.txt'),
      error = document.querySelector('.error'),
      btn = document.querySelector('button');

let exodus = '';
let scope = {};
let place = 0;
let placeStart = 0;
let placeEnd = 0;

function printResult(text) {
    if (text === '') {
        error.innerHTML = '';
    }
    else if (text !== '' && error.innerHTML === '') {
        error.innerHTML = text;
    }
    
}

function isInt(number) {

    if (number.match('[\*]{2}|[-\+\*\/]') !== null) {
        return false;
    }

    if (number.match('^[а-яА-Яa-zA-Z]+[0-9]+') !== null) {
        return false;
    }

    if (number.match('^[0-7]+') == number) {
        printResult('');
        return true;
    }
    else {
        printResult(`Ошибка: число ${number} не является восьмеричным`);
        return false;
    }
}

function isOperation(operation) {
    if (operation === '+' || operation === '-' || operation === '/' || operation === '*' || operation === '**') {
        return true;
    }
    else {
        return false;
    }
}

function isVar(variable) {

    if (variable.match('[\*]{2}|[-\+\*\/]') !== null) {
        return false;
    }

    if (variable.match('^[0-7]+')) {
        return false;
    }

    if (!variable.match('^[а-яА-Я]')) {
        printResult('Ошибка в названии переменной: ошибка алфавита');
        return false;
    }

    if (variable.match('^[а-яА-Я][0-7]{3}') == variable) {
        printResult('');
        return true;
    }
    else {
        printResult('Ошибка в формате переменной. Правильный формат: Буква Цифра Цифра Цифра');
        return false;
    }
}

function isLanguage(text) {
    console.log('Язык:')
    console.log(text)
    if (text[0].toLowerCase() !== 'программа') {
        place = 0;
        printResult('Ошибка: программа должна начинаться словом "Программа"');
        return false;
    }
    placeStart++;

    for (let i = 1; i < text.length-1; i++) {
        if (!isOperators(text[i])) {
            return false;
        }
    }
    place++;

    if (text[text.length-1].toLowerCase() !== 'конец') {
        printResult('Ошибка: программа должна заканчиваться словом "Конец"');;
        return false;
    }

    return true;
}

function isOperators(text) {
    text = text.split(' ');
    console.log('Операторы:')
    console.log(text)

    place++;

    if (text[0].toLowerCase() !== 'ввод' || text[1].toLowerCase() !== 'текста') {
        printResult('Ошибка: ожидалось "Ввод текста"');
        return false;
    }
    place++; place++;

    if (text.length < 3) {
        printResult('Ошибка: ожидалась метка')
        return false;
    }
    place++;

    if (!isOperator(text.slice(2))) {
        return false;
    }
    place++;

    return true;
}

function isOperator(text) {
    console.log('Оператор:')
    console.log(text)
    let newText = [[]]
    let k = 0
    let metkaSeen = false;

    for (let i = 0; i < text.length; i++) {
        if (text[i] !== ';')
            newText[k].push(text[i])
        else {
            newText[k].push(text[i])
            newText.push([])
            k++;
        }
    }

    newText = newText.filter(item => item != '')

    console.log(newText)

    for (let i = 0; i < newText.length; i++) {

        let status = 1;
        let v = '';
        
        for (let j = 0; j < newText[i].length; j++) {

            console.log(`${place} - ${newText[i][j]}`)

            if (newText[i][j] === '') {
                place++;
                placeStart++;
                continue;
            }

            if (status === 1) {
                if (newText[i][j] === ':' && metkaSeen) {
                    status += 2;
                }
                else if (newText[i][j] === ':' && !metkaSeen) {
                    printResult('Ошибка: ожидалась метка');
                    return false;
                }
                else if (!isInt(newText[i][j])) {
                    printResult('Ошибка: ожидалась метка');
                    return false;
                }
                metkaSeen = true;
                place++;
                
                // status++;
            }
            else if (status === 2) {
                if (newText[i][j] !== ':') {
                    printResult('Ошибка: ожидалось ":"');
                    return false;
                }
                place++;
                status++;
            }
            else if (status === 3) {
                if (newText[i].length > 2 && isVar(newText[i][j])) {
                    scope[newText[i][j]] = 0;
                    v = newText[i][j];
                    place++;
                    status++;
                }
                else {
                    printResult('Ошибка: ожидалась переменная')
                    return false;
                }
            }
            else if (status === 4) {
                if (newText[i][j] !== '=') {
                    printResult('Ошибка: ожидалось "="');
                    return false;
                }
                place++;
                status++;
            }
            else if (status === 5) {

                if (isRightPart(newText[i].slice(j))) {

                    let expression = newText[i].slice(j).filter(item => item != '').join('').slice(0, -1).replaceAll('[', '(').replaceAll(']', ')');

                    for (const [key, value] of Object.entries(scope)) {

                        if (expression.indexOf(key) > -1)
                            expression = expression.replaceAll(key, value)

                    }

                    try {
                        scope[v] = BigInt(Math.round(eval(expression).toString(8)));
                    }
                    catch (RangeError) {
                        printResult('Ошибка: число слишком большое')
                        return false;
                    }

                    break;

                }
                else
                    return false;
            }
        }
        
    }

    return true;

}

let countOfStartCircleBrackets = 0;
let countOfEndCircleBrackets = 0;
let countOfStartSquareBrackets = 0;
let countOfEndSquareBrackets = 0;

function isRightPart(part) {
    console.log(`Правая часть:`)
    console.log(part)
    let IntOrVarSeen = false;
    let operationSeen = true;
    let bracketsOpenSeen = false;
    let bracketsCloseSeen = false;

    let squareBracketsOpenSeen = false;
    let squareBracketsCloseSeen = false;
    let isLastSquareClosed = true;

    let isLastClosed = true;

    let semicolonSeen = false

    let minusSeen = false;

    for (let i = 0; i < part.length; i++) {

        place++;
        console.log(`${place} - ${part[i]}`)

        if (part[i] === '') {
            placeStart++;
            continue;
        } 

        if (part[i] === ';' && operationSeen) {
            printResult('Ошибка: после знака операции не может стоять ";"')
            return false;
        }
        if (part[i] === ';') {
            semicolonSeen = true;
            break;
        }

        if (operationSeen || bracketsOpenSeen || squareBracketsOpenSeen) {

            // if (part[i] === '-' && !minusSeen) {

            //     minusSeen = true;
            //     continue;

            // }
            // else if (part[i] === '-' && minusSeen) {
            //     printResult('Ошибка: ожидалось целое число или переменная')
            //     return false;
            // }

            if (part[i] === '(') {

                countOfStartCircleBrackets++;
                bracketsOpenSeen = true;
                isLastClosed = false;
                minusSeen = false;

            }
            else if (part[i] === '[') {

                countOfStartSquareBrackets++;
                squareBracketsOpenSeen = true;
                isLastSquareClosed = false;
                minusSeen = false;

            }
            else if (isInt(part[i])) {

                operationSeen = false;
                IntOrVarSeen = true;
                bracketsOpenSeen = false;
                squareBracketsOpenSeen = false;
                minusSeen = false;

            }
            else if (isVar(part[i])) {

                if (Object.keys(scope).indexOf(part[i]) > -1) {
                    operationSeen = false;
                    IntOrVarSeen = true;
                    bracketsOpenSeen = false;
                    squareBracketsOpenSeen = false;
                    minusSeen = false;
                }
                else {
                    printResult(`Ошибка: переменная ${part[i]} не найдена`)
                    return false;
                }

            }
            else {

                printResult('Ошибка: два знака операции подряд')
                return false;

            }

        }
        else if (IntOrVarSeen || bracketsCloseSeen || squareBracketsCloseSeen) {

            if (part[i] === ')') {

                countOfEndCircleBrackets++;
                bracketsCloseSeen = true;
                isLastClosed = true;

            }
            else if (part[i] === ']') {

                countOfEndSquareBrackets++;
                squareBracketsCloseSeen = true;
                isLastSquareClosed = true;

            }
            else if (isOperation(part[i])) {

                IntOrVarSeen = false;
                operationSeen = true;
                bracketsCloseSeen = false;
                squareBracketsCloseSeen = false;
    
            }
            else {
                printResult('Ошибка: ожидался знак операции');
                return false;

            }

        }
        else if (!operationSeen || !isInt(part[0]) || !isVar(part[0])) {

            return false;
            
        }

    }

    let openBr = 0;
    let closedBr = 0;

    for (let i = 0; i < part.length; i++) {

        if (part[i] === '[')
            openBr++;
        else if (part[i] === ']')
            // closedBr++;
            openBr--;

        if (openBr > 2) {
            printResult('Ошибка: допустимая глубина вложенности квадратных скобок - 2');
            return false;
        }

        if (openBr === closedBr) {
            openBr = 0;
            closedBr = 0;
            printResult('');
        }


    }

    // (5 + [5 + 5) + 5]
    // [5 + (5 + 5] + 5)

    

    if (countOfStartCircleBrackets > countOfEndCircleBrackets) {

        printResult('Ошибка: отсутствует закрывающая скобка ")"');
        placeStart = part.indexOf('(');
        return false;

    }
    else if (countOfStartCircleBrackets < countOfEndCircleBrackets) {

        printResult('Ошибка: отсутствует открывающая скобка "("');
        placeStart = part.indexOf(')');
        return false;

    }
    else if (countOfStartSquareBrackets > countOfEndSquareBrackets) {

        printResult('Ошибка: отсутствует закрывающая скобка "]"');
        placeStart = part.indexOf('[');
        return false;

    }
    else if (countOfStartSquareBrackets < countOfEndSquareBrackets) {

        printResult('Ошибка: отсутствует открывающая скобка "["');
        placeStart = part.indexOf(']');
        return false;

    }

    if (!isLastClosed) {

        printResult('Ошибка: отсутствует открывающая скобка "("');
        placeStart = part.indexOf(')');
        return false;

    }
    else if (!isLastSquareClosed) {

        printResult('Ошибка: отсутствует открывающая скобка "["');
        placeStart = part.indexOf(']');
        return false;

    }

    let list = []
    let removed = ''

    for (let i = 0; i < part.length; i++) {
        if (part[i] === '(') {
            list.push(part[i])
        }

        if (part[i] === '[') {
            list.push(part[i])
        }

        if (part[i] === ')') {
            if (list[list.length-1] === '(')
                removed = list.pop(part[i])
            else {
                printResult('Ошибка: пересечение скобок')
                return false;
            }
        }

        if (part[i] === ']') {
            if (list[list.length-1] === '[')
                removed = list.pop(part[i])
            else {
                printResult('Ошибка: пересечение скобок')
                return false;
            }
        }
    }

    if (operationSeen) {

        printResult('Ошибка: два знака операции подряд')
        console.log()
        return false;

    }

    if (!semicolonSeen) {
        printResult('Ошибка: ожидалось ";"')
        return false;
    }

    countOfStartCircleBrackets = 0;
    countOfEndCircleBrackets = 0;
    countOfStartSquareBrackets = 0;
    countOfEndSquareBrackets = 0;

    return true;
}

function compile(text) {
    countOfStartCircleBrackets = 0;
    countOfEndCircleBrackets = 0;
    countOfStartSquareBrackets = 0;
    countOfEndSquareBrackets = 0;

    error.style.color = 'rgb(236, 82, 82)'
    printResult('');
    scope = {};
    place = 0;
    placeStart = 0;
    placeEnd = 0;

    let originalText = text.replaceAll('+', ' + ')
                           .replaceAll('-', ' - ')
                           .replaceAll('*', ' * ')
                           .replaceAll('/', ' / ')
                           .replaceAll('^', ' ** ')
                           .replaceAll('(', '( ')
                           .replaceAll(')', ' )')
                           .replaceAll('[', '[ ')
                           .replaceAll(']', ' ]')
                           .replaceAll(':', ' : ')
                           .replaceAll(';', ' ; ')
                           .replaceAll('=', ' = ')
                           .trim();
    
    console.log(originalText)

    exodus = originalText.replaceAll('\n', ' ').split(' ');
    console.log(exodus);

    originalText = originalText.split('\n').map(item => item.trim());

    console.log(originalText)

    if (isLanguage(originalText)) {
        let result = '';
        for (const [key, value] of Object.entries(scope)) {
            result += `${key} = ${value}<br>`;
        }
        error.style.color = '#000'
        printResult(result);
        let regex = new RegExp('</{0,1}mark>')
        code.innerHTML = code.innerHTML.replace(regex, '')
    }
    else {
        if (place > exodus.length)
            place = exodus.length-1
        for (let i = 0; i < place; i++) {
            placeStart += exodus[i].length;
        }
        placeEnd = placeStart + exodus[place == 0 ? place : place-1].length + 1;
        code.innerHTML = code.textContent.substring(0, placeStart) + '<mark>' + code.textContent.substring(placeStart, placeEnd) + '</mark>' + code.textContent.substring(placeEnd);
    }

    console.log(`place = ${place}`);
    console.log(`placeStart = ${placeStart}`);
    console.log(`placeEnd = ${placeEnd}`);

    console.log(code.textContent)
}

btn.addEventListener('click', () => {
    let codeText = code.textContent;
    compile(codeText);
});