const analyzeWithAsyncAwait = async (data) => {
    // Group data by country
    const countryGroups = new Map();
    data.forEach(record => {
        if (!countryGroups.has(record.Country)) {
            countryGroups.set(record.Country, []);
        }
        countryGroups.get(record.Country).push(record);
    });

    // Analyze each country's data concurrently
    const analysisPromises = Array.from(countryGroups.entries()).map(
        async ([country, records]) => {
            // Simulate I/O operations (e.g., DB queries, file operations)
            await new Promise(resolve => setTimeout(resolve, 100));

            const analysis = {
                country,
                recordCount: records.length,
                timespan: {
                    start: Math.min(...records.map(r => r.Year)),
                    end: Math.max(...records.map(r => r.Year))
                },
                inflationStats: {
                    avg: records.reduce((sum, r) => sum + r.Inflation, 0) / records.length,
                    max: Math.max(...records.map(r => r.Inflation)),
                    min: Math.min(...records.map(r => r.Inflation))
                }
            };

            // Calculate volatility (standard deviation)
            const mean = analysis.inflationStats.avg;
            analysis.inflationStats.volatility = Math.sqrt(
                records.reduce((sum, r) =>
                    sum + Math.pow(r.Inflation - mean, 2), 0) / records.length
            );

            return analysis;
        }
    );

    return Promise.all(analysisPromises);
}

export default {
    analyzeWithAsyncAwait,
}