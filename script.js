// File handling functions (from original JavaScript)
var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON to filter blank rows
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            // Filter out blank rows (rows where all cells are empty, null, or undefined)
            var filteredData = jsonData.filter(row => row.some(filledCell));

            // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            // Fallback
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }

            // Convert filtered JSON back to CSV
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
            return csv;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}

// Interactive functionality for protegerse.html
$(document).ready(function() {
    // Security test functionality
    $('#submit-test').click(function() {
        let scores = { A: 0, B: 0, C: 0 };
        let questions = ['q1', 'q2', 'q3', 'q4', 'q5'];
        
        questions.forEach(function(q) {
            let value = $(`input[name=${q}]:checked`).val();
            if (value) scores[value]++;
        });

        let resultText = '';
        let resultClass = '';
        if (scores.B >= 3) {
            resultText = '¡Excelente! Tienes buenos hábitos de seguridad digital.';
            resultClass = 'alert-success';
        } else if (scores.C >= 3) {
            resultText = 'Vas por buen camino, pero puedes mejorar algunos aspectos.';
            resultClass = 'alert-warning';
        } else {
            resultText = 'Es hora de tomar tu seguridad digital más en serio. Comienza implementando las buenas prácticas paso a paso.';
            resultClass = 'alert-danger';
        }

        $('#test-results').removeClass('alert-success alert-warning alert-danger')
            .addClass('alert ' + resultClass)
            .text(resultText)
            .show();
    });

    // Contact form functionality
    $('#submit-contact').click(function() {
        let nombre = $('#nombre').val();
        let correo = $('#correo').val();
        let consulta = $('#consulta').val();
        let mensaje = $('#mensaje').val();

        if (nombre && correo && consulta && mensaje) {
            $('#contact-result').removeClass('alert-danger')
                .addClass('alert alert-success')
                .text('¡Consulta enviada con éxito! Te responderemos en un plazo máximo de 24 horas.')
                .show();
            $('#nombre, #correo, #consulta, #mensaje').val('');
        } else {
            $('#contact-result').removeClass('alert-success')
                .addClass('alert alert-danger')
                .text('Por favor, completa todos los campos.')
                .show();
        }
    });
});