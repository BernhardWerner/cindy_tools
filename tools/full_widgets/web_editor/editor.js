




let cindy;
let consoleOutput = document.getElementById('console-output');
let scriptList = ["init", "draw", "tick", "mousemove", "mousedown", "mousedrag", "mouseup"];
let importList = ["animation", "ui", "color", "camera"];
let runButton = document.getElementById('runButton');


// function update_textareas() {
//     for (let i = 0; i < scriptList.length; i++) {
//         let scriptElement = document.getElementById('cs' + scriptList[i]);
//         let script = scriptElement.textContent;
//         let textarea = document.getElementById('textEditArea-' + scriptList[i]);
//         let codeMirrorInstance = textarea.nextElementSibling.CodeMirror;

//         if (codeMirrorInstance) {
//             codeMirrorInstance.setValue(script);
//         } else {
//             console.log("CodeMirror instance not found for " + scriptList[i]);
//         }
//     }
// }


function startCindy() {
    consoleOutput.innerHTML = '';

    let params = {
        canvasname: "CSCanvas",
        scripts: "cs*",
        images: {},
        import: {}
        // oninit: update_textareas,
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




function saveToSessionStorage() {
    scriptList.forEach(function (scriptName) {
        let scriptContent = document.getElementById('textEditArea-' + scriptName).value;
        sessionStorage.setItem(scriptName, scriptContent);
    });
    importList.forEach(function (importName) {
        let importContent = document.getElementById(importName + 'Checkbox').checked;
        sessionStorage.setItem(importName, importContent);
    });
}
window.addEventListener('beforeunload', saveToSessionStorage);


function loadFromSessionStorage() {
    scriptList.forEach(function (scriptName) {
        let scriptContent = sessionStorage.getItem(scriptName);
        if (scriptContent) {
            document.getElementById('textEditArea-' + scriptName).value = scriptContent;
        }
    });
    importList.forEach(function (importName) {
        let importContent = sessionStorage.getItem(importName);
        if (importContent) {
            document.getElementById(importName + 'Checkbox').checked = importContent === 'true';
        }
    });
}
window.addEventListener('DOMContentLoaded', loadFromSessionStorage);









function replaceTab(event) {
    var keyCode = event.keyCode || event.which;
    if (keyCode === 9) {
        event.preventDefault();
        var textarea = event.target;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var tabSpaces = '    ';
        textarea.value = textarea.value.substring(0, start) + tabSpaces + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
    }
}
document.addEventListener("keydown", function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveToSessionStorage();
    }

    if (event.shiftKey && event.key === 'Enter') {
        run();
    }
});

function run() {
    saveToSessionStorage();

    for (let i = 0; i < scriptList.length; i++) {
        let script = document.getElementById('textEditArea-' + scriptList[i]).value;
        let scriptElement = document.getElementById('cs' + scriptList[i]);
        scriptElement.textContent = script;
    }
    startCindy();
}




// ************************************************************



document.addEventListener('DOMContentLoaded', function() {
    var textareas = document.querySelectorAll('textarea');
    textareas.forEach(function(textarea) {
        CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            lineWrapping: true,
        });
    });
    var codeMirrors = document.querySelectorAll('.CodeMirror');
    window.addEventListener('resize', function () {
        codeMirrors.forEach(function (cm) {
            cm.CodeMirror.setSize(null, document.getElementsByClassName('left-column').clientHeight);
        });
    });





    var tabs = document.querySelectorAll('.tab-links a');
    var panels = document.querySelectorAll('.tab-content');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            tabs.forEach(function(t) { t.parentElement.classList.remove('active'); });
            panels.forEach(function(p) { p.classList.remove('active'); });

            tab.parentElement.classList.add('active');
            var panel = document.querySelector(tab.getAttribute('href'));
            panel.classList.add('active');
            var codeMirrors = panel.querySelectorAll('.CodeMirror');
            codeMirrors.forEach(function(cm) {
                cm.CodeMirror.refresh();
            });
        });
    });
    
    const columnResizer = document.querySelector('.column-resizer');
    const rowResizer = document.querySelector('.row-resizer');
    const leftColumn = document.querySelector('.left-column');
    const topRow = document.querySelector('.top-row');
    const container = document.querySelector('.container');
  
    let isResizingColumn = false;
    let isResizingRow = false;
  
    // Prevent text selection
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
  