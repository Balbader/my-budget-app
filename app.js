// BUDGET CONTROLLER
const budgetController = (function () {
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    const calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach((cur) => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    const data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget     : 0,
        percentage : -1
    };
    return {
        addItem : function (type, des, val) {
            let newItem;
            let ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }          
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }         
            data.allItems[type].push(newItem);          
            return newItem;
        },
        deleteItem : function (type, id) {
            const ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            const index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget : function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        calculatePercentages : function () {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages : function () {
            const allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget : function () {
            return {
                budget     : data.budget,
                totalInc   : data.totals.inc,
                totalExp   : data.totals.exp,
                percentage : data.percentage
            };
        },
        testing : function () {
            console.log(data);
        }
    };
})();

// UI CONTROLLER
const UIController = (function () {
    const DOMstrings = {
        inputType           : '.add__type',
        inputDescription    : '.add__description',
        inputValue          : '.add__value',
        inputBtn            : '.add__btn',
        incomeContainer     : '.income__list',
        expensesContainer   : '.expenses__list',
        budgetLabel         : '.budget__value',
        incomeLabel         : '.budget__income--value',
        expensesLabel       : '.budget__expenses--value',
        percentageLabel     : '.budget__expenses--percentage',
        container           : '.container',
        expensesPercLabel   : '.item__percentage',
        dateLabel           : '.budget__title--month'
    };
    const formatNumber = function (num, type) {
        let int;
        num = Math.abs(num);
        num = num.toFixed(2);
        const numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        const dec = numSplit[1];
        return (type === 'exp' ? sign = '-' : '+') + ' ' + int + '.' + dec;
    };
    const nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput : function () {
            return {
                type        : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value       : parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },
        addListItem : function (obj, type) {
            let html;
            let newHtml;
            let element;
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem : function (selectorID) {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields : function () {
            const fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            const fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function (current, index, array) {
                current.value = '';
            });
            fieldsArray[0].focus();
        },
        displayBudget : function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages : function (percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
        },
        displayMonth : function () {
            const now = new Date();
            const year = now.getFullYear();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType : function () {
            const fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings : function () {
            return DOMstrings;
        }
    };
})();

// GLOBAL APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {
    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    const updateBudget = function () {
        budgetCtrl.calculateBudget();
        const budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };
    const updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        const percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    };
    const ctrlAddItem = function () {
        let newItem;
        const input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };
    const ctrlDeleteItem = function (event) {
        let splitID;
        let type;
        let ID;
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    };
    return {
        init : function () {
            console.log('It\'s on!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget     : 0,
                totalInc   : 0,
                totalExp   : 0,
                percentage : -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);
controller.init();
