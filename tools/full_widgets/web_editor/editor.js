document.addEventListener('DOMContentLoaded', function() {
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
  