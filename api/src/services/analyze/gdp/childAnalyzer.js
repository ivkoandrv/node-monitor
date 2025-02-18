process.on('message', ({ chunk, processId }) => {
    const yearlyAnalysis = {};

    // Group and analyze by year
    chunk.forEach(record => {
        if (!yearlyAnalysis[record.Year]) {
            yearlyAnalysis[record.Year] = {
                count: 0,
                totalInflation: 0,
                countries: new Set()
            };
        }

        yearlyAnalysis[record.Year].count++;
        yearlyAnalysis[record.Year].totalInflation += record.Inflation;
        yearlyAnalysis[record.Year].countries.add(record.Country);
    });

    // Calculate averages and prepare results
    const results = Object.entries(yearlyAnalysis).map(([year, data]) => ({
        year: parseInt(year),
        avgInflation: data.totalInflation / data.count,
        countryCount: data.countries.size
    }));

    process.send({ processId, results });
});