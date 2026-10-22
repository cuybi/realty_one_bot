// Storage Utilities
const storage = {
    save: (key, data) => localStorage.setItem(`lucerito_${key}`, JSON.stringify(data)),
    get: (key) => JSON.parse(localStorage.getItem(`lucerito_${key}`) || '[]'),
    getObj: (key) => JSON.parse(localStorage.getItem(`lucerito_${key}`) || '{}')
};

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        
        const targetView = e.currentTarget.getAttribute('data-view');
        document.getElementById(`view-${targetView}`).classList.add('active');
        
        const titleText = e.currentTarget.textContent.trim();
        document.getElementById('page-title').textContent = titleText;

        if(targetView === 'dashboard') loadDashboard();
        if(targetView === 'sales') loadSales();
        if(targetView === 'expenses') loadExpenses();
        if(targetView === 'inventory') loadInventory();
        if(targetView === 'recipes') loadRecipes();
        if(targetView === 'reports') loadReports();
    });
});

// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if (id === 'modal-sale') document.getElementById('form-sale').reset();
    if (id === 'modal-expense') document.getElementById('form-expense').reset();
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Calculators
window.calculateSaleTotal = function() {
    const qty = parseFloat(document.getElementById('sale-quantity').value) || 0;
    const price = parseFloat(document.getElementById('sale-price').value) || 0;
    document.getElementById('sale-total').value = (qty * price).toFixed(2);
}

window.calculateExpenseTotal = function() {
    const qty = parseFloat(document.getElementById('expense-quantity').value) || 0;
    const price = parseFloat(document.getElementById('expense-price').value) || 0;
    document.getElementById('expense-total').value = (qty * price).toFixed(2);
}

// Dashboard
async function loadDashboard() {
    const sales = storage.get('sales');
    const expenses = storage.get('expenses');
    
    const totalSales = sales.reduce((sum, s) => sum + s.total_price, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total_price, 0);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date.startsWith(todayStr)).reduce((sum, s) => sum + s.total_price, 0);
    const todayExpenses = expenses.filter(e => e.date.startsWith(todayStr)).reduce((sum, e) => sum + e.total_price, 0);
    
    const dishCounts = {};
    sales.forEach(s => dishCounts[s.dish_name] = (dishCounts[s.dish_name] || 0) + s.quantity);
    const topDish = Object.keys(dishCounts).reduce((a, b) => dishCounts[a] > dishCounts[b] ? a : b, "-");

    updateDashboardUI({
        today_sales: todaySales,
        today_expenses: todayExpenses,
        net_profit: totalSales - totalExpenses,
        top_dish: topDish
    });
}

function updateDashboardUI(data) {
    document.getElementById('kpi-today-sales').textContent = `Bs. ${data.today_sales.toLocaleString('es-BO', {minimumFractionDigits: 2})}`;
    document.getElementById('kpi-today-expenses').textContent = `Bs. ${data.today_expenses.toLocaleString('es-BO', {minimumFractionDigits: 2})}`;
    document.getElementById('kpi-net-profit').textContent = `Bs. ${data.net_profit.toLocaleString('es-BO', {minimumFractionDigits: 2})}`;
    document.getElementById('kpi-top-dish').textContent = data.top_dish;
}

// Sales
async function loadSales() {
    const sales = storage.get('sales');
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';
    sales.forEach(sale => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sale.id || 'L'}</td>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.dish_name}</td>
            <td>${sale.quantity}</td>
            <td>Bs. ${sale.unit_price.toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
            <td>Bs. ${sale.total_price.toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
            <td>${sale.payment_method}</td>
            <td><button class="btn btn-danger" onclick="deleteSale('${sale.localId}')"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.submitSale = function(e) {
    e.preventDefault();
    const qty = parseFloat(document.getElementById('sale-quantity').value);
    const price = parseFloat(document.getElementById('sale-price').value);
    
    const payload = {
        dish_name: document.getElementById('sale-dish').value,
        quantity: qty,
        unit_price: price,
        payment_method: document.getElementById('sale-payment').value,
        total_price: qty * price,
        date: new Date().toISOString(),
        localId: Date.now().toString()
    };

    const sales = storage.get('sales');
    sales.unshift(payload);
    storage.save('sales', sales);
    
    closeModal('modal-sale');
    loadSales();
    loadDashboard();
}

window.deleteSale = function(localId) {
    if(!confirm("¿Seguro que deseas eliminar esta venta?")) return;
    const sales = storage.get('sales');
    const filtered = sales.filter(s => s.localId !== localId);
    storage.save('sales', filtered);
    loadSales();
    loadDashboard();
}

// Expenses
async function loadExpenses() {
    const expenses = storage.get('expenses');
    const tbody = document.querySelector('#expenses-table tbody');
    tbody.innerHTML = '';
    let totalSaldo = 0;

    expenses.forEach(expense => {
        totalSaldo += expense.total_price;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(expense.date).toISOString().split('T')[0]}</td>
            <td>${expense.item_name}</td>
            <td>${expense.category}</td>
            <td>${expense.quantity}</td>
            <td>Bs. ${expense.unit_price.toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
            <td>Bs. ${expense.total_price.toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
            <td><button class="btn btn-danger" onclick="deleteExpense('${expense.localId}')"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('expenses-total-footer').textContent = `Bs. ${totalSaldo.toLocaleString('es-BO', {minimumFractionDigits: 2})}`;
}

window.submitExpense = function(e) {
    e.preventDefault();
    const qty = parseFloat(document.getElementById('expense-quantity').value);
    const price = parseFloat(document.getElementById('expense-price').value);
    
    const payload = {
        item_name: document.getElementById('expense-item').value,
        category: document.getElementById('expense-category').value,
        quantity: qty,
        unit_price: price,
        total_price: qty * price,
        date: new Date().toISOString(),
        localId: Date.now().toString()
    };

    const expenses = storage.get('expenses');
    expenses.unshift(payload);
    storage.save('expenses', expenses);
    
    closeModal('modal-expense');
    loadExpenses();
    loadDashboard();
}

window.deleteExpense = function(localId) {
    if(!confirm("¿Seguro que deseas eliminar este gasto?")) return;
    const expenses = storage.get('expenses');
    const filtered = expenses.filter(e => e.localId !== localId);
    storage.save('expenses', filtered);
    loadExpenses();
    loadDashboard();
}

// Inventory
async function loadInventory() {
    const expenses = storage.get('expenses');
    const sales = storage.get('sales'); // Podríamos restar stock basado en ventas si hubiera recetas
    const recipes = storage.get('recipes');
    const inventorySettings = storage.getObj('inventory_settings');
    
    // Calcular stock: Compras - Consumo (Ventas * Receta)
    const stock = {};
    
    // Sumar compras
    expenses.forEach(e => {
        if (e.category === 'Ingrediente') {
            stock[e.item_name] = (stock[e.item_name] || 0) + e.quantity;
        }
    });

    // Restar ventas si existe receta
    sales.forEach(sale => {
        const recipe = recipes.find(r => r.dishName === sale.dish_name);
        if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ing => {
                if (stock[ing.item]) {
                    stock[ing.item] -= (ing.qty * sale.quantity);
                }
            });
        }
    });

    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    
    let hasLowStock = false;

    Object.keys(stock).forEach(name => {
        const currentStock = stock[name];
        const minStock = inventorySettings[name] || 5;
        const isLow = currentStock < minStock;
        if (isLow) hasLowStock = true;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${name}</td>
            <td style="font-weight: 600; color: ${isLow ? 'var(--danger-color)' : 'inherit'}">${currentStock.toFixed(2)}</td>
            <td>
                <input type="number" value="${minStock}" 
                       onchange="updateMinStock('${name}', this.value)" 
                       style="width: 70px; padding: 4px;">
            </td>
            <td>
                <span class="badge ${isLow ? 'badge-danger' : 'badge-success'}">
                    ${isLow ? 'Stock Bajo' : 'Normal'}
                </span>
            </td>
            <td>-</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('low-stock-alert').style.display = hasLowStock ? 'inline-block' : 'none';
}

window.updateMinStock = function(name, value) {
    const settings = storage.getObj('inventory_settings');
    settings[name] = parseFloat(value);
    localStorage.setItem('lucerito_inventory_settings', JSON.stringify(settings));
    loadInventory();
}

// Recipes
window.addIngredientRow = function() {
    const expenses = storage.get('expenses');
    const items = [...new Set(expenses.filter(e => e.category === 'Ingrediente').map(e => e.item_name))];
    
    const container = document.getElementById('recipe-ingredients-list');
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.marginBottom = '10px';
    
    let options = '<option value="">Seleccionar...</option>';
    items.forEach(item => options += `<option value="${item}">${item}</option>`);

    row.innerHTML = `
        <select class="recipe-item-select" style="flex: 2;" onchange="calculateRecipeTotal()" required>
            ${options}
        </select>
        <input type="number" step="0.01" class="recipe-item-qty" placeholder="Cant." style="flex: 1;" oninput="calculateRecipeTotal()" required>
        <span class="recipe-item-cost" style="flex: 1; font-size: 0.9rem; align-self: center;">Bs. 0.00</span>
        <button type="button" class="btn btn-danger" style="padding: 5px 10px;" onclick="this.parentElement.remove(); calculateRecipeTotal();">&times;</button>
    `;
    container.appendChild(row);
}

window.calculateRecipeTotal = function() {
    const expenses = storage.get('expenses');
    const rows = document.querySelectorAll('.ingredient-row');
    let total = 0;

    rows.forEach(row => {
        const itemName = row.querySelector('.recipe-item-select').value;
        const qty = parseFloat(row.querySelector('.recipe-item-qty').value) || 0;
        
        const lastPurchase = expenses.filter(e => e.item_name === itemName).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const unitPrice = lastPurchase ? lastPurchase.unit_price : 0;
        
        const rowCost = qty * unitPrice;
        total += rowCost;
        row.querySelector('.recipe-item-cost').textContent = `Bs. ${rowCost.toFixed(2)}`;
    });

    document.getElementById('recipe-total-cost').value = total.toFixed(2);
}

window.submitRecipe = function(e) {
    e.preventDefault();
    const dishName = document.getElementById('recipe-dish-name').value;
    const totalCost = parseFloat(document.getElementById('recipe-total-cost').value);
    
    const ingredients = [];
    document.querySelectorAll('.ingredient-row').forEach(row => {
        const item = row.querySelector('.recipe-item-select').value;
        if (item) {
            ingredients.push({
                item: item,
                qty: parseFloat(row.querySelector('.recipe-item-qty').value)
            });
        }
    });

    const recipe = { dishName, totalCost, ingredients, localId: Date.now().toString() };
    const recipes = storage.get('recipes');
    recipes.unshift(recipe);
    storage.save('recipes', recipes);
    
    closeModal('modal-recipe');
    loadRecipes();
}

async function loadRecipes() {
    const recipes = storage.get('recipes');
    const tbody = document.querySelector('#recipes-table tbody');
    tbody.innerHTML = '';

    recipes.forEach(recipe => {
        const suggestedPrice = recipe.totalCost * 1.30; 
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${recipe.dishName}</td>
            <td>Bs. ${recipe.totalCost.toFixed(2)}</td>
            <td style="color: var(--success-color); font-weight: bold;">Bs. ${suggestedPrice.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteRecipe('${recipe.localId}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteRecipe = function(localId) {
    if(!confirm("¿Seguro que deseas eliminar esta receta?")) return;
    const recipes = storage.get('recipes');
    const filtered = recipes.filter(r => r.localId !== localId);
    storage.save('recipes', filtered);
    loadRecipes();
}

// Reports
async function loadReports() {
    const sales = storage.get('sales');
    const expenses = storage.get('expenses');
    
    const totalSales = sales.reduce((sum, s) => sum + s.total_price, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total_price, 0);
    
    document.getElementById('report-total-sales').textContent = `Bs. ${totalSales.toLocaleString('es-BO', {minimumFractionDigits: 2})}`;
    document.getElementById('report-total-expenses').textContent = `Bs. ${totalExpenses.toLocaleString('es-BO', {minimumFractionDigits: 2})}`;
    document.getElementById('report-net-profit').textContent = `Bs. ${(totalSales - totalExpenses).toLocaleString('es-BO', {minimumFractionDigits: 2})}`;

    const dishSales = {};
    sales.forEach(s => dishSales[s.dish_name] = (dishSales[s.dish_name] || 0) + s.total_price);
    const dishBody = document.querySelector('#report-dishes-table tbody');
    dishBody.innerHTML = '';
    Object.entries(dishSales).sort((a,b) => b[1] - a[1]).forEach(([name, total]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${name}</td><td>Bs. ${total.toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>`;
        dishBody.appendChild(tr);
    });

    const paymentSales = {};
    sales.forEach(s => paymentSales[s.payment_method] = (paymentSales[s.payment_method] || 0) + s.total_price);
    const paymentBody = document.querySelector('#report-payments-table tbody');
    paymentBody.innerHTML = '';
    Object.entries(paymentSales).forEach(([method, total]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${method}</td><td>Bs. ${total.toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>`;
        paymentBody.appendChild(tr);
    });
}

// Export/Import
window.exportToCSV = function() {
    const sales = storage.get('sales');
    const expenses = storage.get('expenses');
    
    let csv = "REPORTE LUCERITO CRM\n\nVENTAS\nFecha,Plato,Cantidad,PrecioU,Total,MetodoPago\n";
    sales.forEach(s => {
        csv += `${s.date.split('T')[0]},${s.dish_name},${s.quantity},${s.unit_price},${s.total_price},${s.payment_method}\n`;
    });
    
    csv += "\nCOMPRAS / GASTOS\nFecha,Item,Categoria,Cantidad,PrecioU,Total\n";
    expenses.forEach(e => {
        csv += `${e.date.split('T')[0]},${e.item_name},${e.category},${e.quantity},${e.unit_price},${e.total_price}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_lucerito.csv";
    link.click();
}

window.exportBackup = function() {
    const data = {
        sales: storage.get('sales'),
        expenses: storage.get('expenses'),
        recipes: storage.get('recipes'),
        inventory_settings: storage.getObj('inventory_settings')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lucerito_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

window.importBackup = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("¿Seguro que deseas importar estos datos? Se sobrescribirán los datos actuales.")) {
                if (data.sales) storage.save('sales', data.sales);
                if (data.expenses) storage.save('expenses', data.expenses);
                if (data.recipes) storage.save('recipes', data.recipes);
                if (data.inventory_settings) storage.save('inventory_settings', data.inventory_settings);
                alert("Datos importados con éxito.");
                location.reload();
            }
        } catch (err) {
            alert("Error al leer el archivo de respaldo.");
        }
    };
    reader.readAsText(file);
}

window.clearAllData = function() {
    if (confirm("¿ESTÁS SEGURO? Esta acción borrará TODOS los datos de ventas, gastos y recetas permanentemente.")) {
        if (confirm("Confirma una vez más: ¿Realmente quieres borrar todo?")) {
            localStorage.clear();
            alert("Todos los datos han sido eliminados.");
            location.reload();
        }
    }
}

// Init
window.onload = () => {
    loadDashboard();
};

