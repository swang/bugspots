'use strict';

var Bugspots
  , git = require('gift')
  , exec = require('child_process').exec

function Bugspots() {
  this.hotspots = {}
}

function Fix(message, date, files) {
  this.message = message
  this.date = date
  this.files = files
}

function HotSpots(opts) {
  this.file = opts.file
  this.score = opts.score
}

Bugspots.prototype.scan = function(opts, callback) {

  var _regex = /\b(fix(es|ed)?|close(s|d)?)\b/i

  var repo = git(opts.repo)
    , branch = opts.branch || 'master'
    , depth = opts.depth || 500
    , regex = opts.regex || _regex
    , self = this

  var fireWhenZero = function(val, fn) {
    if (val === 0) {
      fn()
    }
  }

  repo.branch(branch, function(err, head) {
    if (err) {
      return callback(err)
    }
    head.repo.commits(head.commit.id, 100, function(err, commits) {
      var fixes = []
        , after = 0

      if (err) {
        return callback(err)
      }

      commits.forEach(function forEachCommit(commit) {

        if (regex.test(commit.message)) {
          var cmd = 'git diff ' + commit.id + '..' + commit.parents()[0].id + ' --name-only'
            , opt = { cwd: head.repo.path }

          after++

          exec(cmd, opt, function execFn(err, stdout) {
            var files

            if (err) {
              return callback(err)
            }

            files = stdout.split('\n').slice(0, -1)

            var isAfter = function() {
                fixes.forEach(function fixesLoop(fix) {
                  fix.files.forEach(function fixLoop(file) {
                    var utc = Date.parse(new Date().toUTCString())
                      , fixUTC = Date.parse(fix.date)
                      , oldestUTC = Date.parse(fixes[0].date)
                      , t = 1 - ((utc - fixUTC) / (utc - oldestUTC))

                    if (!self.hotspots[file]) {
                      self.hotspots[file] = 0
                    }

                    self.hotspots[file] += 1 / (1 + Math.exp((-12 * t) + 12))
                  })
                })
                return callback(null,
                  Object.keys(self.hotspots)
                    .sort(function sortFn(a, b) { return -(self.hotspots[a] - self.hotspots[b]) })
                    .map(function mapFn(file) { return new HotSpots({ file: file, score: self.hotspots[file] }) })
                )
              }

            fixes.push(new Fix(commit.message.split('\n')[0], commit.committed_date, files))

            after--
            fireWhenZero(after, isAfter)
          })
        }
      })
    })
  })

}
module.exports = Bugspots
