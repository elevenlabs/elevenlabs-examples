## Expo DOM Components

- we serve dom components from file:// scheme only for production build. if you test debug build, it's http:// still.
- in some cases for debug build, that would use http:// and a lan ip (non localhost). it has no secure context for webview. a real example is that you run debug app on real devices. in this case, you can try to use `npx expo start --tunnel`. that would serve dom components using https:// with secure context. detail steps for your repo:
  1. `npx expo install expo-dev-client`
  2. add `.expo.scheme="elevenlabs"` in app.json
  3. `npx expo prebuild --clean`
  4. apply this patch for expo-cli: https://gist.github.com/Kudo/1fb5fd6bfdf20dec29273d9ca797123f
  5. `npx expo start --tunnel`
  6. `npx expo run:ios --device`
