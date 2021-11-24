high
- [x] move to electron so people don't have to do crazy shit to launch this
  - [x] set up electron dev environment
  - [x] make a production build, make sure it works
  - [x] get github to auto-build the app
- [x] provide some user-y way of describing the data source you want
- [ ] fill out the link templates for the other 25 resource types
- [ ] intercept CMD/CTRL + F to focus the search box
- [ ] make this work:`.variant.*=Fury`

low
- [ ] link entries to their respective documentation pages
- [ ] allow user to make search case sensitive
- [ ] make quotes work better (e.g. `foo bar'baz bing` currently groups as `["foo", "bar'baz bing"]` instead of `["foo", "bar'baz", "bing"]`)
- [ ] support <, >, >=, and <=
- [ ] handle commodities (currently all of them are nested under one `trade` resource which makes searching dumb)
- [ ] handle scrolling to specific line
- [ ] allow controller of editor link type
- [ ] some mechanism to show images/sprite (link to other tools?)