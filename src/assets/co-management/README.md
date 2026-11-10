# Corporate management photographs

Drop each portrait here, named after the person's **first name in lower case**:

    hasith.jpg          Hasith Prematillake
    sujith.jpg          Sujith De Alwis
    roshane.jpg         Roshane Perera
    pamudith.jpg        Pamudith Gunawardana
    roshani.jpg         Roshani Dharmaratne
    clyed.jpg           Clyed Gabriel
    jayendra.jpg        Jayendra Fonseka
    yoosoof.jpg         Yoosoof Ihthisham
    ruwan.jpg           Ruwan Kumara
    lalani.jpg          Lalani Weeraarachchi
    mahesh.jpg          Mahesh Abeywickrama
    panduka.jpg         Panduka Rathnayake
    ruwini.jpg          Ruwini Silva
    dilshan.jpg         Dilshan Nanayakkara
    nanduni.jpg         Nanduni Dahanayaka

`.jpg` `.jpeg` `.png` and `.webp` all work. Nothing else needs editing —
`src/data/management.js` picks the files up automatically.

Anyone without a photograph shows their initials instead, so the page is
never broken by a missing file.

Square portraits look best; they are cropped to a circle. Around
400 x 400 px is plenty.

If a filename cannot match the first name, set `photoKey` on that person in
`src/data/management.js` to the filename without its extension.
