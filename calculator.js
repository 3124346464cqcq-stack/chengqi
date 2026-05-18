const display = document.getElementById('display');
const clearBtn = document.getElementById('clear');
const deleteBtn = document.getElementById('delete');
const equalsBtn = document.getElementById('equals');
const numberBtns = document.querySelectorAll('.btn.number');
const operatorBtns = document.querySelectorAll('.btn.operator');

let currentInput = '0';
let previousInput = '';
let operator = '';
let shouldResetDisplay = false;

// Update display
function updateDisplay() {
    display.value = currentInput;
}

// Append number to current input
function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (num === '.' && currentInput.includes('.')) {
            return; // Prevent multiple decimal points
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

// Handle operator
function handleOperator(op) {
    if (operator && !shouldResetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
}

// Calculate result
function calculate() {
    if (!operator || shouldResetDisplay) return;

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                currentInput = 'Error';
                updateDisplay();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    currentInput = Math.round(result * 100000000) / 100000000; // Prevent floating point errors
    operator = '';
    shouldResetDisplay = true;
    updateDisplay();
}

// Clear display
function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    shouldResetDisplay = false;
    updateDisplay();
}

// Delete last character
function deleteLast() {
    if (currentInput === 'Error') {
        clearDisplay();
        return;
    }
    currentInput = currentInput.toString().slice(0, -1);
    if (currentInput === '') {
        currentInput = '0';
    }
    updateDisplay();
}

// Event listeners for number buttons
numberBtns.forEach(btn => {
    btn.addEventListener('click', () => appendNumber(btn.textContent));
});

// Event listeners for operator buttons
operatorBtns.forEach(btn => {
    btn.addEventListener('click', () => handleOperator(btn.textContent));
});

// Event listeners for special buttons
clearBtn.addEventListener('click', clearDisplay);
deleteBtn.addEventListener('click', deleteLast);
equalsBtn.addEventListener('click', calculate);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '+' || e.key === '-') handleOperator(e.key);
    if (e.key === '*') {
        e.preventDefault();
        handleOperator('*');
    }
    if (e.key === '/') {
        e.preventDefault();
        handleOperator('/');
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
    }
    if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    }
    if (e.key === 'Escape') clearDisplay();
});

// Initialize
updateDisplay();
