var inquirer = require('inquirer');
var diffImport = require('diff');
var fs = require('fs-extra');
var Server = require('./server');

class Inquire {
  constructor(diff, log, notify) {
    this.diff = diff;
    this.log = log;
    this.notify = notify;
  }

  inquire(options, file, choices, obj, fileRecords) {
    var map = options.map,
      db = options.db,
      snc = options.snc,
      data = options.db.payload[db.field],
      callback = options.callback,
      diffPatch = diffImport.createPatch(file, data, obj.records[0][map.field]),
      conflictsValue = this.diff.diffFiles(file, data, obj.records[0][map.field]),
      opts = [{
        type: 'list',
        message: 'Conflict on file: ' + file,
        name: 'conflict',
        choices: choices
      }],
      log = this.log,
      notify = this.notify,
      diff = this.diff;

    inquirer
      .prompt(opts)
      .then(function (answers) {
        if (answers['conflict'] === 'resolve conflicts') {
          log.warn('Please resole conflicts in ("%s") before pushing changes.', map.keyValue);

          //Sync, otherwise it will fire the onchange event with an incomplete file. If it happens that the incomplete file is 0 bytes in length it will override all the changes with the file from the server.
          fs.writeFileSync(file, conflictsValue, "UTF-8");
          diff.displayPatch(log, diffPatch);
          callback(false);
          return;
        } else if (answers['conflict'] === 'overwrite file in ServiceNow') {
          log.info('Updating instance version ("%s").', map.keyValue);
          Server.push(snc, db, function (complete) {
            if (complete) {
              // update hash for collision detection
              fileRecords[file].saveHash(data, function (saved) {
                if (saved) {
                  notify.msg(notify.codes.UPLOAD_COMPLETE, {
                    file: map.keyValue,
                    open: fileRecords[file].getRecordUrl()
                  });
                  log.info('Updated instance version: %s.%s : query: %s', db.table, db.field, db.query);
                  log.debug('Updated instance version:', db);
                  log.info('Action done successfully');
                  return;
                } else {
                  notify.msg(notify.codes.COMPLEX_ERROR);
                }
                callback(saved);
              });
            } else {
              notify.msg(notify.codes.UPLOAD_ERROR, {
                file: map.keyValue,
                open: fileRecords[file].getRecordUrl()
              });
              callback(complete);
            }
          });
        } else if (answers['conflict'] === 'overwrite local file') {
          fs.writeFile(file, obj.records[0][map.field]);
          log.info('Local file has overwritten successfully.');
          return;
        } else {
          log.info('Action aborted.');
          return;
        }

      })
      .catch(function (e) {
        log.error('Action failed');
        log.debug(e);
      });
  };
}

module.exports = Inquire;