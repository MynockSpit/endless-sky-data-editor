
Step 1: Install Node 16

**Mac/Unix**: It's strongly recommended you use [nvm](https://github.com/nvm-sh/nvm) to install Node, then run `nvm install lts/gallium`.
**Window**: It's strongly recommended you use [nvm-windows](https://github.com/coreybutler/nvm-windows) to install Node, then run `nvm install lts/gallium`.

Step 2: Run `npm install`

Step 3: Run `npm start`

**NOTE:** The app doesn't automatically pick up changes in file paths. You must run `npm run update-data` to fetch any changes you make.

## Searching

Search happens on a resource-by-resource basis. Every term you provide MUST at least one line in the resource. If all terms are matched, the entire root resource is displayed.

- The `#` prefix can be used to search for resource types.  

  *__example:__ `#ship` gives you a list of all ships*

- The `.` prefix can be used to search for resources with a given property.  

  *__example:__ `.bunks` gives you a list of all resources with a `bunk` property*

- The `=` operator can be used in conjunction with `.` or `#` to search for a resource or a property that **equals** a value.  

  *__example:__ `#ship="Albatross"` gives you all ships with a name or alternate name of `Albatross`.*  

  *__example:__ `.government="Bounty Hunter"` gives you all resources with a government property equal to "Bounty Hunter"*

- The `~=` operator can be used in conjunction with `.` or `#` to search for a resource or a property that **contains** a value.  

  *__example:__ `#ship~="Alba"` gives you all ships with a name or alternate name that contains `Alba`.*  

  *__example:__ `.government~="Bounty"` gives you all resources with a government property that contains to "Bounty"*

- The `/` prefix can be used to search file paths.

  *__example:__ `/path/to/data` searches for resources that come from a file along the path `path/to/data`.*

- Text without an operator searches for any resource with a line containing that text.

  *__example:__ `Albatross` searches for all resources that contain the word "Albatross".*

- Quotes ( `"` ) or Backticks ( "`" ) can be used to group any of the prior operators.

  *__example:__ `"Bounty Hunter"` searches for all resources that contain the word "Bounty Hunter", but not just "Bounty", and not "Hunter Bounty".*

  *__example:__ `#fleet="Small Pug (Wanderer)"` doesn't match a fleet named "Small Pug"`*

  *__example:__ `"#fleet~="Merchants .names~=deep"` likely matches nothing because it's looking for a fleet with the name of "Merchants .names~=deep".*