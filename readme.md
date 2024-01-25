If you come from my portfolio:
As this is such a big project, and for a real client, I'm currently focusing on adding content to the website, thus, validation
might be missing from some parts, no mobile responsiveness, code is currently unorganized, 
and secure policies are not set. In the end everything will be were it has to be with rigorous security measures and good practices.

IMPORTANT

the node dependency: "multer-gridfs-storage": "^5.0.2" is bugged for versions of mongo above mongodb@5.9.1
However, we fixed the issue: 

"id: f._id,
                              
TypeError: Cannot read properties of undefined (reading '_id')
    at GridFSBucketWriteStream.emitFile (C:\studies\SoundProES\node_modules\multer-gridfs-storage\lib\gridfs.js:306:31)"

With a fix from https://github.com/devconcept/multer-gridfs-storage/pull/561/commits/d9cf132f022812fb850312a801c28b61054855c2
