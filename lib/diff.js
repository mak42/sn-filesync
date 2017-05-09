var inquirer = require('inquirer');
var differ = require('diff');

var diff = Object.create(differ.Diff);

diff.tokenize = function (value) {
  return value.split(/(\n|\r\n)/);
};

/**
 * Diffs two file contents.
 * @param  {String} file  file name where diff results will be output.
 * @param  {String} local local file content
 * @param  {String} head  serviceNow instance file
 * @return {String}       The difference between the two file
 * elements present only on the instance are surrounded by an (>>>>> *** ==== HEAD) block
 * elements present only in the local file are surrounded by an (>>>>> *** ==== Local) block
 */
diff.diffFiles = function (file, local, head) {
  "use strict";
  var value = '',
    isNewLn,
    regExp = new RegExp(/^(\n|\r\n|\n\n|\r\n\r\n)$/i),
    endSeparator,
    startSeparator,
    diffs = this.prototype.diff(local, head);

  diffs.forEach(function (part) {
    endSeparator = regExp.test(part.value.charAt(part.value.length - 1)) ? "" : "\n";
    startSeparator = regExp.test(part.value.charAt(0)) ? "" : "\n";
    isNewLn = regExp.test(part.value);

    if (!isNewLn) {
      if (part.removed) {
        value += "\n>>>>>>>>>>" + startSeparator + part.value + endSeparator + "========== Local";
      } else if (part.added) {
        value += "\n>>>>>>>>>>" + startSeparator + part.value + endSeparator + "========== HEAD";
      } else {
        value += '\n' + part.value;
      }

    }
  });

  return value;
};

/**
 * Display a log of diffs in the console terminal.
 * @param  {String} diffs Diffs to show in the console
 */
diff.displayPatch =function(log, diffs) {
    var logs = '';

    diffs = diffs.split(/(\n|\r\n)/);

    for (var i = 0; i < diffs.length - 1; i++) {
       if (diffs[i].charAt(0) === "-") {
            logs += diffs[i].red;
       } else if (diffs[i].charAt(0) === "+") {
            logs += diffs[i].green;
       } else {
            logs += diffs[i];
       }
    }
    log.info(logs);
}

module.exports = diff;