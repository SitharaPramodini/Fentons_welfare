# Office bearer photographs

Drop a portrait here named after the role:

    president.jpg
    secretary.jpg
    treasurer.jpg

`.jpg` `.jpeg` `.png` and `.webp` all work. Nothing else needs editing -
`src/data/governance.js` picks the file up automatically.

The **name** is separate: set `name` on that bearer in
`src/data/governance.js`. The Constitution names nobody, so names live only
there and must be changed when the Committee changes.

Someone with a name but no photograph shows their initials. Someone with no
name shows the role on its own, as before.

Square portraits look best; they are cropped to a circle. About 400 x 400 px
is plenty.
