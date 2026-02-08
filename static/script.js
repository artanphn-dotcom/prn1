document.addEventListener('DOMContentLoaded', () => {
    console.log('Python-based Apartment App Initialized');

    const contentArea = document.getElementById('content-area');

    async function fetchData() {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Data fetched from Python backend:', data);
            
            // For now, just display a simple message.
            // We will build the UI rendering logic next.
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                        <h3 class="text-xl font-semibold">Welcome!</h3>
                        <p class="mt-2">The application has successfully loaded data from the Python backend.</p>
                        <pre class="mt-4 p-2 bg-gray-100 dark:bg-slate-700 rounded text-sm overflow-auto">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Failed to fetch data:', error);
            if (contentArea) {
                contentArea.innerHTML = `<p class="text-red-500">Failed to load data from the server. See console for details.</p>`;
            }
        }
    }

    fetchData();
});
