// ============================================================
// Hafiz Websites — Client Tracker Sync
// Google Apps Script for syncing client data to a Google Sheet
// ============================================================

const SHEET_NAME = 'Sheet1'; // change if you renamed the sheet tab
const SHARED_SECRET = 'CHANGE-THIS-TO-A-RANDOM-STRING'; // set this to anything you like

// Column order — MUST match the headers in row 1 of your sheet
const COLUMNS = [
  'id', 'name', 'contact', 'project',
  'totalAmount', 'advanceAmount', 'advanceDate', 'deliveryDate',
  'stage', 'domainName', 'domainType', 'domainFunding', 'domainPurchased',
  'hostingType', 'hostingPurchased', 'revisionStatus', 'notes', 'createdAt'
];

// ============================================================
// Handle GET requests — return all clients
// ============================================================
function doGet(e) {
  if (!isAuthorized(e)) return jsonResponse({ error: 'Unauthorized' }, 401);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return jsonResponse({ clients: [] });

  const headers = data[0];
  const clients = data.slice(1)
    .filter(row => row[0]) // skip rows without an id
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        // Convert boolean-ish text back to booleans
        if (val === 'TRUE' || val === true) val = true;
        else if (val === 'FALSE' || val === false) val = false;
        // Convert dates back to ISO strings
        else if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        obj[h] = val;
      });
      return obj;
    });
  return jsonResponse({ clients });
}

// ============================================================
// Handle POST requests — save (insert or update) client(s)
// ============================================================
function doPost(e) {
  if (!isAuthorized(e)) return jsonResponse({ error: 'Unauthorized' }, 401);
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Replace-all mode (used by the app to push the full client list)
  if (body.action === 'replace_all' && Array.isArray(body.clients)) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, COLUMNS.length).clearContent();
    if (body.clients.length === 0) return jsonResponse({ ok: true, count: 0 });
    const rows = body.clients.map(c => COLUMNS.map(col => (c[col] == null ? '' : c[col])));
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
    return jsonResponse({ ok: true, count: rows.length });
  }

  // Single-client upsert mode
  if (body.client) {
    upsertClient(sheet, body.client);
    return jsonResponse({ ok: true });
  }

  // Delete mode
  if (body.action === 'delete' && body.id) {
    deleteClient(sheet, body.id);
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: 'No action recognized' }, 400);
}

// ============================================================
// Helpers
// ============================================================
function upsertClient(sheet, client) {
  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (data[r][0] === client.id) {
      const row = COLUMNS.map(col => (client[col] == null ? '' : client[col]));
      sheet.getRange(r + 1, 1, 1, COLUMNS.length).setValues([row]);
      return;
    }
  }
  // Not found — append
  const row = COLUMNS.map(col => (client[col] == null ? '' : client[col]));
  sheet.appendRow(row);
}

function deleteClient(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (data[r][0] === id) {
      sheet.deleteRow(r + 1);
      return;
    }
  }
}

function isAuthorized(e) {
  const provided = (e && e.parameter && e.parameter.secret) || '';
  return provided === SHARED_SECRET;
}

function jsonResponse(obj, status) {
  // Apps Script doesn't allow custom status codes for web apps,
  // but we include the field in the body so the app can check it.
  if (status && status !== 200) obj._status = status;
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
