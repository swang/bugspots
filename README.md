# bugspots
bugspots is a port of the ruby gem bugspots, which in turn is based on a Google blog post. The gist of it is that files in which commit messages containing fix/close usually signify that the file is prone to having bugs.

# install

```
npm install bugspots
```

# documentation

## Bugspots
### #scan(opts, callback)

**opts** is an object containing the following:
```json
{
  repo: <repo>, // this is the location of the repo.
  branch: <branch>, // this is the branch you want to scan.
  depth: <depth>, // not implemented, as it is not implemented in the gem.
  regex: <regex> // regular expression to use to match commits to use.
}
```
**callback** pass in a function with the signature (err, hotspots), where hotspots returns an array
of hotspot objects containing the filename and the score of the file in sorted order.

# license
MIT

# author
Shuan Wang (shuanwang@gmail.com)
