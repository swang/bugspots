var BugSpots = require('./index')

var z = new BugSpots()

z.scan({ repo: process.argv[2] }, function cb(err, hotspots) {
  if (err) { console.log(err) }
  else { console.log('hotspots: ', hotspots) }
})
