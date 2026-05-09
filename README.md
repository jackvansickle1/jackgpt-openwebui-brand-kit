# JackGPT OpenWebUI Brand Kit

Public brand-overlay assets used to make a self-hosted OpenWebUI deployment feel like a polished JackGPT product.

## Included

- Runtime loader for title, favicon, manifest, and public text replacements
- Dark command-center stylesheet
- Favicon, splash, logo, manifest, and PWA image assets

## Not Included

- OpenWebUI source code
- User data, chats, database files, admin configuration, or secrets
- Any deployment tunnel credentials

## Integration Sketch

Mount the files into the container static directory, then load `loader.js` from the app shell or reverse-proxy injection layer.

