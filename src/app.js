document.addEventListener('DOMContentLoaded', () => {
    const salesDataDiv = document.getElementById('salesData');

    // Fetch sales data from the backend
    fetch('/api/sales')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                salesDataDiv.innerHTML = '<p>No sales data available.</p>';
                return;
            }

            // Render sales data
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Account Reference</th>
                        <th>Time of Sale</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(sale => `
                        <tr>
                            <td>${sale.id}</td>
                            <td>${sale.accountReference}</td>
                            <td>${sale.timeOfSale}</td>
                            <td>${sale.totalNetAmountWithTax}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            salesDataDiv.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching sales data:', error);
            salesDataDiv.innerHTML = '<p>Error loading sales data. Please try again later.</p>';
        });
});