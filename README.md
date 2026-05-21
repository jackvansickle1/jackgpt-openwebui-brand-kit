# JackGPT OpenWebUI Brand Kit

Public brand-overlay assets used to make a self-hosted OpenWebUI deployment feel like a polished JackGPT product.

## What Recruiters Should Inspect

- `loader.js`: runtime brand replacement, favicon/head injection, cache busting, starter prompt onboarding, and public text cleanup.
- `custom.css`: dark command-center styling, login/signup polish, composer styling, modals, buttons, and responsive onboarding panel.
- PWA/favicon/logo assets that replace default upstream visual identity.

## Included

- Runtime loader for title, favicon, manifest, and public text replacements
- Dark command-center stylesheet
- First-user onboarding panel with starter prompts and links to the broader JackGPT ecosystem
- Favicon, splash, logo, manifest, and PWA image assets

## Not Included

- OpenWebUI source code
- User data, chats, database files, admin configuration, or secrets
- Any deployment tunnel credentials
- Underlying search implementation details unless a visitor explicitly asks about internals

## Integration Sketch

Mount the files into the container static directory, then load `loader.js` from the app shell or reverse-proxy injection layer.
