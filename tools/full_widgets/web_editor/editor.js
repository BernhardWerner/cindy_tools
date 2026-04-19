const scriptList = ["init", "draw", "tick", "mousemove", "mousedown", "mousedrag", "mouseup"];
const importList = ["animation", "ui", "color", "camera"];

let cindy;
let consoleOutput;
let runButton;
let clearButton;
let animationCheckbox;
let uiCheckbox;
let colorCheckbox;
let cameraCheckbox;

// Object to store CodeMirror instances keyed by script name,
// so we can read/write editor content without touching the underlying <textarea> directly.
let codeMirrors = {};


// ─── Console interception ────────────────────────────────────────────────────

function displayConsoleMessage(message, isError = false) {
    // Guard against calls that arrive before DOMContentLoaded has run
    // (e.g. errors thrown during script initialisation).
    if (!consoleOutput) return;

    // Wrap each message in a <span> rather than a bare text node so we can
    // apply error styling without a separate wrapper element per message.
    const span = document.createElement('span');
    if (isError) span.classList.add('console-error');

    // Set textContent rather than innerHTML so that user-supplied strings
    // containing HTML are never executed as markup.
    span.textContent = message;

    const lineBreak = document.createElement('br');
    consoleOutput.appendChild(span);
    consoleOutput.appendChild(lineBreak);

    // Keep the latest output visible without forcing the user to scroll manually.
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Monkey-patch console.log and console.error so that CindyJS output appears
// in the in-page console panel.
//
// CindyJS routes println() through console.log and runtime errors through
// console.error. We do NOT pass a csconsole element to CindyJS (see startCindy)
// because that would cause CindyJS to write to the DOM directly with its own
// red styling, duplicating and overriding our formatting.
(function() {
    const originalLog   = console.log;
    const originalError = console.error;

    console.log = function(message) {
        displayConsoleMessage(message, false);
        originalLog.apply(console, arguments);
    };

    console.error = function(message) {
        displayConsoleMessage(message, true);
        originalError.apply(console, arguments);
    };
})();


// ─── CindyJS lifecycle ───────────────────────────────────────────────────────

function startCindy() {
    consoleOutput.innerHTML = '';

    // Shut down any previously running CindyJS instance before creating a new
    // one. Without this, each Run click stacks up animation loops and event
    // listeners from the old instance, causing subtle bugs and memory leaks.
    if (cindy && typeof cindy.shutdown === 'function') {
        cindy.shutdown();
    }

    const packagesToImport = [];
    const singletsToImport = [];

    // CindyJS distinguishes "packages" (stateful, e.g. Animation, UI) from
    // "singletons" (stateless utility modules, e.g. Color, Camera).
    if (animationCheckbox.checked) packagesToImport.push("../animation");
    if (uiCheckbox.checked)        packagesToImport.push("../ui");
    if (colorCheckbox.checked)     singletsToImport.push("../color");
    if (cameraCheckbox.checked)    singletsToImport.push("../camera");

    const params = {
        canvasname: "CSCanvas",
        // "cs*" tells CindyJS to discover script blocks whose id starts with "cs",
        // matching the <script id="csinit">, <script id="csdraw">, … elements in the HTML.
        scripts: "cs*",
        images: {},
        // csconsole is intentionally omitted. When set, CindyJS writes directly to
        // the DOM element with its own red styling, which duplicates and overrides
        // the formatting applied by our console.log / console.error monkey-patches.
        // All CindyJS output (println → console.log, errors → console.error) is
        // captured by those patches instead.
        import: {
            packages: packagesToImport,
            init:     singletsToImport
        }
    };

    cindy = CindyJS(params);
}


// ─── Persistence ─────────────────────────────────────────────────────────────

function saveToLocalStorage() {
    // Persist editor contents so the user's work survives a page reload.
    scriptList.forEach(function(scriptName) {
        const content = codeMirrors[scriptName].getValue();
        // Only write non-empty scripts to avoid cluttering storage with blank slots
        // that would shadow later prefill loading (see initializeTextAreas).
        if (content !== "") {
            localStorage.setItem(scriptName, content);
        }
    });

    // Persist checkbox states so the same imports are pre-selected on reload.
    importList.forEach(function(importName) {
        const checked = document.getElementById(importName + 'Checkbox').checked;
        localStorage.setItem(importName, checked);
    });
}


// ─── Initialisation helpers ──────────────────────────────────────────────────

function initializeCheckboxStates() {
    const urlParams = new URLSearchParams(window.location.search);

    importList.forEach(function(importName) {
        const checkbox = document.getElementById(importName + 'Checkbox');
        if (!checkbox) return;

        if (urlParams.has(importName)) {
            // URL parameters take priority so that shareable links can force
            // specific imports regardless of what the user had last time.
            checkbox.checked = true;
        } else {
            const stored = localStorage.getItem(importName);
            // Explicit null check: an absent key means "never saved", not false.
            checkbox.checked = stored !== null ? stored === 'true' : false;
        }
    });
}

async function initializeTextAreas() {
    const urlParams = new URLSearchParams(window.location.search);

    if (!urlParams.has('prefill')) return;

    const prefill = urlParams.get('prefill');

    for (const scriptName of scriptList) {
        const stored = localStorage.getItem(scriptName);

        if (stored !== null) {
            // Prefer the stored version so that a user who has edited a prefill
            // doesn't lose their changes on reload.
            codeMirrors[scriptName].setValue(stored);
            continue;
        }

        const path = './prefills/' + prefill + '/' + scriptName + '.cjs';
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            console.log('Loading prefill from: ' + path);
            const data = await response.text();
            codeMirrors[scriptName].setValue(data);
        } catch (error) {
            // Missing prefill files are expected for scripts that are intentionally
            // empty (e.g. mousedrag when the demo doesn't need it), so only log
            // a warning rather than throwing.
            console.log('Prefill not found (skipping): ' + path + ' — ' + error.message);
        }
    }
}


// ─── DOMContentLoaded setup ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function() {
    consoleOutput = document.getElementById('console-output');

    runButton    = document.getElementById('runButton');
    resetButton  = document.getElementById('resetButton');
    exportButton = document.getElementById('exportButton');
    clearButton  = document.getElementById('clearButton');

    animationCheckbox = document.getElementById('animationCheckbox');
    uiCheckbox        = document.getElementById('uiCheckbox');
    colorCheckbox     = document.getElementById('colorCheckbox');
    cameraCheckbox    = document.getElementById('cameraCheckbox');

    // Declare layout references here, before any event handlers that use them,
    // to avoid a temporal dead zone (TDZ) if a handler fires during setup.
    const container     = document.querySelector('.container');
    const leftColumn    = document.querySelector('.left-column');
    const topRow        = document.querySelector('.top-row');
    const bottomRow     = document.querySelector('.bottom-row');

    // Replace each <textarea> with a CodeMirror instance so users get
    // syntax highlighting and line numbers without changing the rest of the code
    // (we still look up editors by the original textarea's name suffix).
    document.querySelectorAll('textarea').forEach(function(textarea) {
        const scriptName = textarea.id.replace('textEditArea-', '');
        codeMirrors[scriptName] = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            lineWrapping: true,
            theme: 'dracula',
        });
    });

    // Recalculate editor heights when the browser window is resized so the
    // CodeMirror panels fill the available space rather than clipping or scrolling.
    window.addEventListener('resize', function() {
        adjustCodeMirrorSizes(topRow.clientHeight);
        adjustConsoleSize(bottomRow.clientHeight);
    });

    // ── Tab switching ────────────────────────────────────────────────────────

    const tabs   = document.querySelectorAll('.tab-links a');
    const panels = document.querySelectorAll('.tab-content');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            tabs.forEach(t   => t.parentElement.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.parentElement.classList.add('active');

            const panel = document.querySelector(tab.getAttribute('href'));
            panel.classList.add('active');

            // CodeMirror renders lazily; calling refresh() ensures the gutter and
            // line numbers repaint correctly after the panel becomes visible.
            panel.querySelectorAll('.CodeMirror').forEach(function(cm) {
                cm.CodeMirror.refresh();
            });
        });
    });

    // ── Button handlers ──────────────────────────────────────────────────────

    runButton.addEventListener('click', run);
    resetButton.addEventListener('click', resetEditor);
    exportButton.addEventListener('click', exportScripts);
    clearButton.addEventListener('click', clearConsole);

    // ── Font size control ────────────────────────────────────────────────────

    const FONT_MIN = 10;
    const FONT_MAX = 24;
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');

    function applyFontSize(size) {
        const px = size + 'px';
        consoleOutput.style.fontSize = px;
        for (const name of scriptList) {
            codeMirrors[name].getWrapperElement().style.fontSize = px;
        }
        // Refresh after the browser has applied the new font size so CodeMirror
        // can recompute line heights and gutter widths correctly.
        requestAnimationFrame(function() {
            for (const name of scriptList) {
                codeMirrors[name].refresh();
            }
        });
        fontSizeDisplay.textContent = size;
        localStorage.setItem('fontSize', size);
    }

    const savedFontSize = parseInt(localStorage.getItem('fontSize'), 10) || 13;
    applyFontSize(savedFontSize);

    document.getElementById('fontDecBtn').addEventListener('click', function() {
        const current = parseInt(fontSizeDisplay.textContent, 10);
        if (current > FONT_MIN) applyFontSize(current - 1);
    });

    document.getElementById('fontIncBtn').addEventListener('click', function() {
        const current = parseInt(fontSizeDisplay.textContent, 10);
        if (current < FONT_MAX) applyFontSize(current + 1);
    });

    // ── Load state ───────────────────────────────────────────────────────────

    initializeCheckboxStates();
    await initializeTextAreas();

    // ── Resizable split panels ───────────────────────────────────────────────

    const columnResizer = document.querySelector('.column-resizer');
    const rowResizer    = document.querySelector('.row-resizer');

    let isResizingColumn = false;
    let isResizingRow    = false;

    // Prevent text selection in the rest of the page while a drag is in progress.
    document.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('column-resizer') ||
            e.target.classList.contains('row-resizer')) {
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isResizingColumn || isResizingRow) {
            e.preventDefault();
        }
    });

    columnResizer.addEventListener('mousedown', function() {
        isResizingColumn = true;
        document.addEventListener('mousemove', handleColumnResize);
        document.addEventListener('mouseup', stopResizing);
    });

    rowResizer.addEventListener('mousedown', function() {
        isResizingRow = true;
        document.addEventListener('mousemove', handleRowResize);
        document.addEventListener('mouseup', stopResizing);
    });

    // Apply initial sizes so editors fill the panel on first load.
    adjustCodeMirrorSizes(topRow.clientHeight);
    adjustConsoleSize(bottomRow.clientHeight);

    // ── Canvas dimension label ───────────────────────────────────────────────

    const canvas          = document.getElementById('CSCanvas');
    const canvasSizeLabel = document.getElementById('canvas-size-label');

    function updateCanvasSizeLabel() {
        canvasSizeLabel.textContent = canvas.clientWidth + ' × ' + canvas.clientHeight;
    }

    new ResizeObserver(updateCanvasSizeLabel).observe(canvas);
    updateCanvasSizeLabel();

    // ── Resize handlers (defined here to close over layout constants) ────────

    function handleColumnResize(e) {
        if (!isResizingColumn) return;
        const containerRect = container.getBoundingClientRect();
        leftColumn.style.width = `${e.clientX - containerRect.left}px`;
    }

    function handleRowResize(e) {
        if (!isResizingRow) return;
        const leftColumnRect = leftColumn.getBoundingClientRect();
        topRow.style.height = `${e.clientY - leftColumnRect.top}px`;

        // Keep editor and console sizes in sync after a row drag.
        adjustCodeMirrorSizes(topRow.clientHeight);
        adjustConsoleSize(bottomRow.clientHeight);
    }

    function stopResizing() {
        isResizingColumn = false;
        isResizingRow    = false;
        document.removeEventListener('mousemove', handleColumnResize);
        document.removeEventListener('mousemove', handleRowResize);
        document.removeEventListener('mouseup', stopResizing);
    }
});


// ─── Size helpers ─────────────────────────────────────────────────────────────

function adjustCodeMirrorSizes(height) {
    // Subtract the fixed chrome above the editor (toolbar ~42px, tab bar ~36px,
    // button array ~52px) so CodeMirror expands to fill whatever vertical space remains.
    for (const scriptName of scriptList) {
        codeMirrors[scriptName].setSize(null, height - 145);
        codeMirrors[scriptName].refresh();
    }
}

function adjustConsoleSize(_height) {
    // Console height is controlled by CSS flex layout (flex-grow: 1 on #console-output);
    // no inline height override needed.
}


// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

document.addEventListener("keydown", function(event) {
    // Ctrl/Cmd+S: save without running, matching the muscle-memory of most editors.
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveToLocalStorage();
    }

    // Ctrl/Cmd+Enter: the canonical "execute" shortcut for interactive notebooks and REPLs.
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        run();
    }
});


// ─── Run / Reset / Export ─────────────────────────────────────────────────────

function run() {
    // Persist first so the current code survives a reload even if CindyJS crashes.
    saveToLocalStorage();

    // Copy editor contents into the hidden <script> elements that CindyJS reads.
    // CindyJS discovers these via the "cs*" scripts selector in startCindy().
    for (const scriptName of scriptList) {
        const script = codeMirrors[scriptName].getValue();
        document.getElementById('cs' + scriptName).textContent = script;
    }

    startCindy();
}

function resetEditor() {
    for (const scriptName of scriptList) {
        codeMirrors[scriptName].setValue('');
    }

    // Clear stored scripts so that a subsequent page load starts fresh
    // and prefills (if any) are loaded again from disk.
    localStorage.clear();
}

async function exportScripts() {
    const hasImports = animationCheckbox.checked || uiCheckbox.checked ||
                       colorCheckbox.checked    || cameraCheckbox.checked;
    const choices = await showExportModal(hasImports);
    if (!choices) return;

    if (choices.mode === 'single') {
        await doSingleFileExport(choices.includeCindy, choices.filename);
    } else {
        await doPackagedExport(choices.includeCindy, choices.includePackages, choices.filename);
    }
}

function clearConsole() {
    consoleOutput.innerHTML = '';
}


// ─── Export helpers ───────────────────────────────────────────────────────────

function showExportModal(hasImports) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-title">Export</div>
                <div class="modal-section">
                    <div class="export-options">
                        <label class="export-option">
                            <input type="radio" name="export-mode" value="single" checked>
                            <div>
                                <span class="export-option-title">Single File</span>
                                <span class="export-option-desc">All scripts inlined into one HTML file</span>
                            </div>
                        </label>
                        <label class="export-option">
                            <input type="radio" name="export-mode" value="packaged">
                            <div>
                                <span class="export-option-title">Packaged</span>
                                <span class="export-option-desc">Your code as .cjs files + config.json in a ZIP</span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="modal-section" id="modal-pkg-section" style="display:none">
                    <label class="modal-checkbox">
                        <input type="checkbox" id="modal-include-packages">
                        <span>Include imported packages</span>
                    </label>
                </div>
                <div class="modal-section">
                    <label class="modal-checkbox">
                        <input type="checkbox" id="modal-include-cindy">
                        <span>Download Cindy.js alongside</span>
                    </label>
                </div>
                <div class="modal-section">
                    <label class="modal-label" for="modal-filename">Filename</label>
                    <input type="text" class="modal-input" id="modal-filename" value="index.html">
                </div>
                <div class="modal-buttons">
                    <button class="button button--primary" id="modal-export-btn">Export</button>
                    <button class="button button--secondary" id="modal-cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const pkgSection = overlay.querySelector('#modal-pkg-section');

        const filenameInput = overlay.querySelector('#modal-filename');
        const defaults = { single: 'index.html', packaged: 'cindy-export.zip' };

        overlay.querySelectorAll('input[name="export-mode"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                const mode = overlay.querySelector('input[name="export-mode"]:checked').value;
                pkgSection.style.display = (mode === 'packaged' && hasImports) ? '' : 'none';
                // Auto-update filename only if user hasn't typed a custom value
                if (filenameInput.value === defaults.single || filenameInput.value === defaults.packaged) {
                    filenameInput.value = defaults[mode];
                }
            });
        });

        function finish(result) {
            document.removeEventListener('keydown', onKeydown);
            document.body.removeChild(overlay);
            resolve(result);
        }

        function onKeydown(e) {
            if (e.key === 'Escape') finish(null);
        }
        document.addEventListener('keydown', onKeydown);

        overlay.querySelector('#modal-export-btn').addEventListener('click', function() {
            const mode = overlay.querySelector('input[name="export-mode"]:checked').value;
            finish({
                mode:            mode,
                includeCindy:    overlay.querySelector('#modal-include-cindy').checked,
                includePackages: overlay.querySelector('#modal-include-packages').checked,
                filename:        filenameInput.value.trim() || defaults[mode]
            });
        });

        overlay.querySelector('#modal-cancel-btn').addEventListener('click', function() { finish(null); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) finish(null); });
    });
}


async function doSingleFileExport(includeCindy, filename) {
    const packageScripts = await gatherPackageScripts();

    // Collect entries per slot: package scripts first (so they win ties at place 0)
    const entries = {};
    for (const [slot, slotEntries] of Object.entries(packageScripts)) {
        entries[slot] = slotEntries.slice();
    }

    // Add user scripts at place 0
    for (const name of scriptList) {
        const content = codeMirrors[name].getValue();
        if (content.trim()) {
            if (!entries[name]) entries[name] = [];
            entries[name].push({ place: 0, content: content });
        }
    }

    // Sort each slot by place; stable sort keeps package entries ahead of user at equal place
    const finalScripts = {};
    for (const [slot, slotEntries] of Object.entries(entries)) {
        slotEntries.sort(function(a, b) { return a.place - b.place; });
        finalScripts[slot] = slotEntries.map(function(e) { return e.content; }).join('\n\n');
    }

    downloadTextFile(filename, generateSingleFileHTML(finalScripts));

    if (includeCindy) {
        await downloadRemoteFile('../Cindy.js', 'Cindy.js');
    }
}


async function doPackagedExport(includeCindy, includePackages, filename) {
    const zip = new JSZip();

    // User code: one .cjs per non-empty slot, plus a config.json
    const userConfig = {};
    for (const name of scriptList) {
        const content = codeMirrors[name].getValue().trim();
        if (!content) continue;
        userConfig[name] = [{ name: name + '.cjs', place: 0 }];
        zip.file('user/' + name + '.cjs', content);
    }
    zip.file('user/config.json', JSON.stringify(userConfig, null, 4));

    if (includePackages) {
        await addImportsToZip(zip);
    }

    if (includeCindy) {
        const r = await fetch('../Cindy.js');
        if (r.ok) {
            zip.file('Cindy.js', await r.blob());
        } else {
            console.error('Export: could not fetch Cindy.js — ' + r.status);
        }
    }

    // Build import paths for the generated HTML (./ because HTML lives at zip root)
    const packagesToImport = [];
    const singletsToImport = [];
    if (animationCheckbox.checked) packagesToImport.push('./animation');
    if (uiCheckbox.checked)        packagesToImport.push('./ui');
    if (colorCheckbox.checked)     singletsToImport.push('./color');
    if (cameraCheckbox.checked)    singletsToImport.push('./camera');
    packagesToImport.push('./user');

    zip.file('index.html', generatePackagedHTML(packagesToImport, singletsToImport));

    downloadBlob(filename, await zip.generateAsync({ type: 'blob' }));
}


// Fetch all selected package/singleton .cjs contents.
// Returns { slotName: [{place, content}, ...] }
async function gatherPackageScripts() {
    const result = {};

    async function fetchText(path) {
        const r = await fetch(path);
        if (!r.ok) throw new Error(r.status + ' ' + r.statusText + ': ' + path);
        return r.text();
    }

    // Fetch config.json then each .cjs listed in it, preserving declaration order
    async function processPackage(folder) {
        const config = JSON.parse(await fetchText('../' + folder + '/config.json'));
        for (const [slot, entries] of Object.entries(config)) {
            for (const entry of entries) {
                let name  = typeof entry === 'string' ? entry : entry.name;
                const place = (typeof entry === 'object' && entry.place != null) ? entry.place : 0;
                if (!name.endsWith('.cjs')) name += '.cjs';
                try {
                    const content = await fetchText('../' + folder + '/' + name);
                    if (!result[slot]) result[slot] = [];
                    result[slot].push({ place: place, content: content });
                } catch (e) {
                    console.log('Export: skipping ' + name + ' — ' + e.message);
                }
            }
        }
    }

    // Single .cjs file that contributes to the init slot
    async function processSingleton(filename) {
        try {
            const content = await fetchText('../' + filename);
            if (!result.init) result.init = [];
            result.init.push({ place: 0, content: content });
        } catch (e) {
            console.log('Export: skipping ' + filename + ' — ' + e.message);
        }
    }

    const tasks = [];
    if (animationCheckbox.checked) tasks.push(processPackage('animation'));
    if (uiCheckbox.checked)        tasks.push(processPackage('ui'));
    if (colorCheckbox.checked)     tasks.push(processSingleton('color.cjs'));
    if (cameraCheckbox.checked)    tasks.push(processSingleton('camera.cjs'));
    await Promise.all(tasks);

    return result;
}


// Copy all selected package files into the ZIP under their original folder names
async function addImportsToZip(zip) {
    async function fetchText(path) {
        const r = await fetch(path);
        if (!r.ok) throw new Error(r.status + ': ' + path);
        return r.text();
    }

    async function addPackageFolder(folder) {
        const configText = await fetchText('../' + folder + '/config.json');
        zip.file(folder + '/config.json', configText);
        const config = JSON.parse(configText);
        for (const entries of Object.values(config)) {
            for (const entry of entries) {
                let name = typeof entry === 'string' ? entry : entry.name;
                if (!name.endsWith('.cjs')) name += '.cjs';
                try {
                    zip.file(folder + '/' + name, await fetchText('../' + folder + '/' + name));
                } catch (e) {
                    console.log('Export: skipping ' + name + ' — ' + e.message);
                }
            }
        }
    }

    const tasks = [];
    if (animationCheckbox.checked) tasks.push(addPackageFolder('animation'));
    if (uiCheckbox.checked)        tasks.push(addPackageFolder('ui'));
    if (colorCheckbox.checked) {
        tasks.push(
            fetchText('../color.cjs')
                .then(function(c) { zip.file('color.cjs', c); })
                .catch(function(e) { console.log('Export: ' + e.message); })
        );
    }
    if (cameraCheckbox.checked) {
        tasks.push(
            fetchText('../camera.cjs')
                .then(function(c) { zip.file('camera.cjs', c); })
                .catch(function(e) { console.log('Export: ' + e.message); })
        );
    }
    await Promise.all(tasks);
}


function generateSingleFileHTML(finalScripts) {
    // Standard slots always appear; any extra (e.g. keydown from animation) are appended
    const standardSlots = ['init', 'draw', 'tick', 'mousemove', 'mousedown', 'mousedrag', 'mouseup'];
    const extraSlots = Object.keys(finalScripts).filter(function(s) { return !standardSlots.includes(s); });
    const allSlots = standardSlots.concat(extraSlots);

    const scriptBlocks = allSlots.map(function(slot) {
        // Escape </script> so the HTML parser doesn't prematurely close the tag
        const content = (finalScripts[slot] || '').replace(/<\/script>/gi, '<\\/script>');
        return "<script id='cs" + slot + "' type='text/x-cindyscript'>" +
               (content ? '\n' + content + '\n' : '') +
               '<' + '/script>';
    }).join('\n');

    return [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '    <meta http-equiv="content-type" content="text/html; charset=UTF-8">',
        '    <meta charset="utf-8">',
        '    <title>CindyJS</title>',
        '    <script type="text/javascript" src="./Cindy.js"><' + '/script>',
        '</head>',
        '<body>',
        '',
        scriptBlocks,
        '',
        '<canvas id="CSCanvas" width="1024" height="768" style="border:1px solid #000000;"></canvas>',
        '',
        '<script>',
        'CindyJS({',
        '    canvasname: "CSCanvas",',
        '    scripts: "cs*",',
        '    images: {}',
        '});',
        '<' + '/script>',
        '',
        '</body>',
        '</html>'
    ].join('\n');
}


function generatePackagedHTML(packagesToImport, singletsToImport) {
    const scriptBlocks = ['init', 'draw', 'tick', 'mousemove', 'mousedown', 'mousedrag', 'mouseup']
        .map(function(slot) { return "<script id='cs" + slot + "' type='text/x-cindyscript'><" + "/script>"; })
        .join('\n');

    const importJSON = JSON.stringify({ packages: packagesToImport, init: singletsToImport }, null, 4);

    return [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '    <meta http-equiv="content-type" content="text/html; charset=UTF-8">',
        '    <meta charset="utf-8">',
        '    <title>CindyJS</title>',
        '    <script type="text/javascript" src="./Cindy.js"><' + '/script>',
        '</head>',
        '<body>',
        '',
        scriptBlocks,
        '',
        '<canvas id="CSCanvas" width="1024" height="768" style="border:1px solid #000000;"></canvas>',
        '',
        '<script>',
        'CindyJS({',
        '    canvasname: "CSCanvas",',
        '    scripts: "cs*",',
        '    images: {},',
        '    import: ' + importJSON,
        '});',
        '<' + '/script>',
        '',
        '</body>',
        '</html>'
    ].join('\n');
}


function downloadTextFile(filename, content) {
    downloadBlob(filename, new Blob([content], { type: 'text/html;charset=utf-8' }));
}

function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadRemoteFile(remotePath, localName) {
    try {
        const r = await fetch(remotePath);
        if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
        downloadBlob(localName, await r.blob());
    } catch (e) {
        console.error('Export: failed to fetch ' + remotePath + ' — ' + e.message);
    }
}
