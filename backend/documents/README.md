# The Constitution

Put the signed PDF here as **`constitution.pdf`**.

    backend/documents/constitution.pdf

Members must read it and agree to abide by it before their membership
application can be submitted, so the form will not accept a submission while
this file is missing.

It is served only to signed-in members, through
`GET /api/documents/constitution` - never from the site's public folder. The
document is marked CONFIDENTIAL - INTERNAL COMPANY DOCUMENT, so it must not
be placed anywhere that serves files without a session.

The project's own `assets/constitution.pdf` is checked as well, so the file
works from either place. Set `CONSTITUTION_PDF` in `.env` to use a path
outside the project altogether.
