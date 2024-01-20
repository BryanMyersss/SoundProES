If you come from my portfolio:
I'm currently focusing on the harder stuff, thus everything might seem unorganized, proper validation
might be missing from some parts, no mobile responsiveness also. To see how this project will be 
like at the end check my other project YelpCamp.

IMPORTANT

the node dependency: "multer-gridfs-storage": "^5.0.2" is bugged for versions of mongo above mongodb@5.9.1
However, we fixed the issue: 

"id: f._id,
                              
TypeError: Cannot read properties of undefined (reading '_id')
    at GridFSBucketWriteStream.emitFile (C:\studies\SoundProES\node_modules\multer-gridfs-storage\lib\gridfs.js:306:31)"

With a fix from https://github.com/devconcept/multer-gridfs-storage/pull/561/commits/d9cf132f022812fb850312a801c28b61054855c2