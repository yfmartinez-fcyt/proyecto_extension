document.addEventListener('DOMContentLoaded', function () {
    const labelsNode = document.getElementById('lineas-labels-data');
    const valuesNode = document.getElementById('lineas-values-data');
    const sublineasNode = document.getElementById('sublineas-data');
    const lineasCanvas = document.getElementById('lineasChart');
    const sublineasCanvas = document.getElementById('sublineasChart');
    const lineaSelector = document.getElementById('lineaSelector');

    if (!labelsNode || !valuesNode || !sublineasNode || !lineasCanvas || !sublineasCanvas || !lineaSelector) {
        return;
    }

    const lineasLabels = JSON.parse(labelsNode.textContent);
    const lineasValues = JSON.parse(valuesNode.textContent);
    const sublineasData = JSON.parse(sublineasNode.textContent);

    const lineasCtx = lineasCanvas.getContext('2d');
    const sublineasCtx = sublineasCanvas.getContext('2d');

    function wrapLabel(text, maxLength = 30) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxLength) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }

        if (lines.length === 1) continue;
        if (lines.length === 2) break; // ⬅️ máximo 2 líneas
    }

    if (lines.length < 2 && currentLine) {
        lines.push(currentLine);
    }

    // Si sobra texto → "..."
    if (words.join(' ').length > lines.join(' ').length) {
        lines[1] = (lines[1] || '') + '...';
    }

    return lines;
}

    new Chart(lineasCtx, {
        type: 'bar',
        data: {
            labels: lineasLabels,
            datasets: [{
                label: 'Proyectos',
                data: lineasValues,
                borderWidth: 1,
                borderRadius: 10
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function (items) {
                            return items[0].label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 13
                        }
                    }
                }
            }
        }
    });

    let sublineasChart;

    function renderSublineasChart(linea) {
        const info = sublineasData[linea];
        if (!info) return;

        if (sublineasChart) {
            sublineasChart.destroy();
        }

        sublineasChart = new Chart(sublineasCtx, {
            type: 'doughnut',
            data: {
                labels: info.labels,
                datasets: [{
                    label: 'Proyectos',
                    data: info.data,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        align: 'start',
                        labels: {
                            boxWidth: 14,
                            boxHeight: 14,
                            padding: 25,
                            font: {
                                size: 11
                            },
                            textAlign: 'left',
                            generateLabels(chart) {
                                const original = Chart.overrides.doughnut.plugins.legend.labels.generateLabels(chart);

                                return original.map((item) => {
                                    const label = chart.data.labels[item.index];
                                    return {
                                        ...item,
                                        text: wrapLabel(label, 34)
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderSublineasChart(lineaSelector.value);

    lineaSelector.addEventListener('change', function () {
        renderSublineasChart(this.value);
    });
});