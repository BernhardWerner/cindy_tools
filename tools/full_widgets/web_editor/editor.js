const scriptList = ["init", "draw", "tick", "mousemove", "mousedown", "mousedrag", "mouseup"];
const importList = ["animation", "ui", "color", "camera"];

let cindy;
let consoleOutput;
let runButton;
let animationCheckbox;
let uiCheckbox;
let colorCheckbox;
let cameraCheckbox;

// Object to store CodeMirror instances
let codeMirrors = {};

function startCindy() {
    consoleOutput.innerHTML = '';
    let packagesToImport = [];
    let singletsToImport = [];
    if(animationCheckbox.checked) packagesToImport.push("animation");
    if(uiCheckbox.checked) packagesToImport.push("ui");
    if(colorCheckbox.checked) singletsToImport.push("color");
    if(cameraCheckbox.checked) singletsToImport.push("camera");


    let params = {
        canvasname: "CSCanvas",
        scripts: "cs*",
        images: {},
        import: {
            "packages": packagesToImport,
            "init": singletsToImport
        }
    };

    cindy = CindyJS(params);
}

function displayConsoleMessage(message) {
    var textNode = document.createTextNode(message);
    var lineBreak = document.createElement('br');
    consoleOutput.appendChild(textNode);
    consoleOutput.appendChild(lineBreak);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

(function() {
    var oldLog = console.log;
    console.log = function(message) {
        displayConsoleMessage(message);
        oldLog.apply(console, arguments);
    };
})();

function saveToLocalStorage() {
    scriptList.forEach(function (scriptName) {
        let scriptContent = codeMirrors[scriptName].getValue(); // Get content from CodeMirror
        if(scriptContent != "") {
            localStorage.setItem(scriptName, scriptContent);
        }
    });
    importList.forEach(function (importName) {
        let importContent = document.getElementById(importName + 'Checkbox').checked;
        localStorage.setItem(importName, importContent);
    });
}

function initializeCheckboxStates() {
    let urlParams = new URLSearchParams(window.location.search);

    importList.forEach(function(importName) {
        let checkbox = document.getElementById(importName + 'Checkbox');
        if (checkbox) {
            // Check URL parameters first
            if (urlParams.has(importName)) {
                checkbox.checked = true;
            } else {
                // Fallback to session storage
                let sessionValue = localStorage.getItem(importName);
                if (sessionValue !== null) {
                    checkbox.checked = sessionValue === 'true';
                } else {
                    checkbox.checked = false;
                }
            }
        }
    });
}
async function initializeTextAreas() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('prefill')) {
        let prefill = urlParams.get('prefill');
        for (let scriptName of scriptList) {
            let scriptContent = localStorage.getItem(scriptName);
            let path = './prefills/' + prefill + '/' + scriptName + '.cjs';
            if (scriptContent === null) {
                try {
                    let response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${scriptName}: ${response.statusText}`);
                    }
                    console.log('Loading from: ' + path);
                    let data = await response.text();
                    codeMirrors[scriptName].setValue(data);
                } catch (error) {
                    console.error('File not found: ' + error.message);
                }
            } else {
                codeMirrors[scriptName].setValue(scriptContent);
            }
        }
    }
}












document.addEventListener('DOMContentLoaded', async function() {
    consoleOutput = document.getElementById('console-output');
    
    runButton = document.getElementById('runButton');
    resetButton = document.getElementById('resetButton');
    exportButton = document.getElementById('exportButton');

    animationCheckbox = document.getElementById('animationCheckbox');
    uiCheckbox = document.getElementById('uiCheckbox');
    colorCheckbox = document.getElementById('colorCheckbox');
    cameraCheckbox = document.getElementById('cameraCheckbox');

    document.querySelectorAll('textarea').forEach(function(textarea) {
        let scriptName = textarea.id.replace('textEditArea-', '');
        codeMirrors[scriptName] = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            lineWrapping: true,
        });
    });

    window.addEventListener('resize', function () {
        Object.values(codeMirrors).forEach(function(cm) {
            cm.setSize(null, document.querySelector('.left-column').clientHeight);
        });
    });

    const tabs = document.querySelectorAll('.tab-links a');
    const panels = document.querySelectorAll('.tab-content');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            tabs.forEach(function(t) { t.parentElement.classList.remove('active'); });
            panels.forEach(function(p) { p.classList.remove('active'); });

            tab.parentElement.classList.add('active');
            var panel = document.querySelector(tab.getAttribute('href'));
            panel.classList.add('active');
            var cmInstances = panel.querySelectorAll('.CodeMirror');
            cmInstances.forEach(function(cm) {
                cm.CodeMirror.refresh();
            });
        });
    });

    runButton.addEventListener('click', run);
    resetButton.addEventListener('click', resetEditor);
    exportButton.addEventListener('click', exportScripts);

    initializeCheckboxStates();
    await initializeTextAreas();

    const columnResizer = document.querySelector('.column-resizer');
    const rowResizer = document.querySelector('.row-resizer');
    const leftColumn = document.querySelector('.left-column');
    const topRow = document.querySelector('.top-row');
    const container = document.querySelector('.container');
  
    let isResizingColumn = false;
    let isResizingRow = false;

    document.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('column-resizer') || e.target.classList.contains('row-resizer')) {
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', function(e) {
      if (isResizingColumn || isResizingRow) {
        e.preventDefault();
      }
    });

    columnResizer.addEventListener('mousedown', function(e) {
      isResizingColumn = true;
      document.addEventListener('mousemove', handleColumnResize);
      document.addEventListener('mouseup', stopResizing);
    });

    rowResizer.addEventListener('mousedown', function(e) {
      isResizingRow = true;
      document.addEventListener('mousemove', handleRowResize);
      document.addEventListener('mouseup', stopResizing);
    });

    function handleColumnResize(e) {
      if (!isResizingColumn) return;
      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      leftColumn.style.width = `${newWidth}px`;
    }

    function handleRowResize(e) {
      if (!isResizingRow) return;
      const leftColumnRect = leftColumn.getBoundingClientRect();
      const newHeight = e.clientY - leftColumnRect.top;
      topRow.style.height = `${newHeight}px`;
    }

    function stopResizing() {
      isResizingColumn = false;
      isResizingRow = false;
      document.removeEventListener('mousemove', handleColumnResize);
      document.removeEventListener('mousemove', handleRowResize);
      document.removeEventListener('mouseup', stopResizing);
    }
});














document.addEventListener("keydown", function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveToLocalStorage();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        run();
    }
});

function run() {
    saveToLocalStorage();

    for (let i = 0; i < scriptList.length; i++) {
        let scriptName = scriptList[i];
        let script = codeMirrors[scriptName].getValue(); // Get content from CodeMirror
        let scriptElement = document.getElementById('cs' + scriptName);
        scriptElement.textContent = script;
    }
    startCindy();
}

function resetEditor() {
    for(let i = 0; i < scriptList.length; i++) {
        codeMirrors[scriptList[i]].setValue('');
    }
    // for(let i = 0; i < importList.length; i++) {
    //     document.getElementById(importList[i] + 'Checkbox').checked = false;
    // }

    localStorage.clear();
}


function exportScripts() {
    // PLACEHOLDER
}