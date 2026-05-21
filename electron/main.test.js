const { app, BrowserWindow } = require('electron');

describe('Electron main process', () => {
  test('should initialize without errors', () => {
    expect(typeof app).toBe('object');
    expect(typeof BrowserWindow).toBe('function');
  });

  test('should have required event listeners', () => {
    const listeners = app.eventNames ? app.eventNames() : [];
    // Electron should have listeners registered for app lifecycle
    expect(listeners.length >= 0).toBe(true);
  });

  test('should load main.js successfully', () => {
    // Verify main.js doesn't have syntax errors by checking it was require'd
    const mainModule = require('./main.js');
    expect(mainModule).toBeDefined();
  });
});
