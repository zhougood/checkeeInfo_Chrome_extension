// Add styles
const styles = `
    .visa-filter-container {
        margin: 20px 0;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .visa-filter-container label {
        margin-right: 10px;
        font-weight: bold;
        color: #333;
    }
    
    .visa-filter-container select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background-color: white;
        min-width: 150px;
        font-size: 14px;
    }
    
    .visa-filter-container select:hover {
        border-color: #999;
    }
    
    .visa-filter-container select:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
`;

// Function to create and add the filter UI
function addFilterUI() {  
    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'visa-filter-container';
    
    // Create filter label
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Filter by Visa Type: ';
    filterLabel.htmlFor = 'visa-type-filter';
    
    // Create select element
    const filterSelect = document.createElement('select');
    filterSelect.id = 'visa-type-filter';
    
    // Add default "All" option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = 'All Visa Types';
    filterSelect.appendChild(defaultOption);
    
    // Get unique visa types from the table
    const tables = document.querySelectorAll('table');
    const dataTable = tables[6]; // Get the 7th table (0-based index)
    
    const visaTypes = new Set();
    if (dataTable) {
        const rows = Array.from(dataTable.querySelectorAll('tr')).slice(1); // Skip the first row
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 2) {
                const visaType = cells[2].textContent.trim();
                if (visaType) {
                    visaTypes.add(visaType);
                }
            }
        });
    }
    
    // Add options for each visa type
    visaTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        filterSelect.appendChild(option);
    });
    
    // Add event listener for filtering
    filterSelect.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        filterTable(selectedType);
        renderCharts();
    });
    
    // Assemble the filter UI
    filterContainer.appendChild(filterLabel);
    filterContainer.appendChild(filterSelect);
    
    // Insert the filter UI before the table
    if (dataTable) {
        dataTable.parentNode.insertBefore(filterContainer, dataTable);
    } else {
        console.log('No table found to insert filter before');
    }
}

// Function to filter the table
function filterTable(visaType) {
    const tables = document.querySelectorAll('table');
    const dataTable = tables[6]; // Get the 7th table (0-based index)
    if (!dataTable) return;
    
    const rows = Array.from(dataTable.querySelectorAll('tr'));
    const headerRow = rows[0]; // Keep the header row visible
    const dataRows = rows.slice(1); // Skip the header row for filtering
    
    // Always show the header row
    headerRow.style.display = '';
    
    // Filter the data rows
    dataRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 2) {
            const rowVisaType = cells[2].textContent.trim();
            if (visaType === 'all' || rowVisaType === visaType) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function loadECharts(callback) {
    if (window.echarts) return callback();
    // ECharts should always be available as it's loaded as a content script
    console.error('ECharts is not loaded!');
}

// Extract data from the 7th table
function extractVisaData() {
    const tables = document.querySelectorAll('table');
    const dataTable = tables[6];
    if (!dataTable) return [];
    const rows = Array.from(dataTable.querySelectorAll('tr')).slice(1); // skip header
    const data = [];
    for (const row of rows) {
        if (row.style.display === 'none') continue;
        const cells = row.querySelectorAll('td');
        if (cells.length > 6) {
            data.push({
                visaType: cells[2].textContent.trim(),
                status: cells[6].textContent.trim(),
                date: cells[7].textContent.trim()
            });
        }
    };
    console.log('Extracted data:', data);
    return data;
}

// Group data for ECharts
function groupDataByVisaType(data) {
    const grouped = {};
    data.forEach(item => {
        if (!grouped[item.visaType]) grouped[item.visaType] = [];
        grouped[item.visaType].push(item);
    });
    return grouped;
}

// Prepare chart data for a visa type
function prepareChartData(visaData) {
    // Get unique dates sorted
    const dates = Array.from(new Set(visaData.map(d => d.date))).sort();
    // Status categories
    const statusList = ['Pending', 'Clear', 'Reject'];
    // Count by date and status
    const seriesData = statusList.map(status => {
        return {
            name: status,
            type: 'bar',
            stack: 'total',
            emphasis: { focus: 'series' },
            data: dates.map(date =>
                visaData.filter(d => d.date === date && d.status === status).length
            )
        };
    });
    return { dates, seriesData };
}

// Render ECharts for each visa type
function renderCharts() {
    loadECharts(() => {
        const data = extractVisaData();
        const grouped = groupDataByVisaType(data);
        // Container for charts
        let chartContainer = document.getElementById('visa-echarts-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.id = 'visa-echarts-container';
            chartContainer.style.margin = '30px 0';
            chartContainer.style.display = 'flex';
            chartContainer.style.flexDirection = 'column';
            chartContainer.style.alignItems = 'center';
            // Insert chart container after the filter container
            const filterContainer = document.querySelector('.visa-filter-container');
            if (filterContainer) {
                filterContainer.parentNode.insertBefore(chartContainer, filterContainer.nextSibling);
            } else {
                document.body.insertBefore(chartContainer, document.body.firstChild);
            }
        }
        chartContainer.innerHTML = '';
        Object.keys(grouped).forEach(visaType => {
            const { dates, seriesData } = prepareChartData(grouped[visaType]);
            // Create chart div
            const chartDiv = document.createElement('div');
            chartDiv.style.width = '50%';
            chartDiv.style.height = '400px';
            chartDiv.style.marginBottom = '40px';
            chartContainer.appendChild(chartDiv);
            // Init ECharts
            const chart = echarts.init(chartDiv);
            chart.setOption({
                title: { text: `Breakdown of Case Status vs Receipt Date (${visaType})`, left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['Pending', 'Clear', 'Reject'], top: 30 },
                xAxis: { type: 'category', data: dates, name: 'Receipt Date' },
                yAxis: { type: 'value', name: 'Count' },
                series: seriesData.map(series => ({
                    ...series,
                    barWidth: '30%' // Make bars slimmer
                })),
                grid: { left: 60, right: 30, bottom: 60 }
            });
        });
    });
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    // Add styles
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    // Initialize the filter
    addFilterUI();
}); 