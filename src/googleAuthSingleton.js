export const GoogleAuth = (function () {
  let instance;

  function create() {
    let _auth;
    let _token;
    const _folderName = '159mYuPKRRR15EI9m-yWXsGFLt8evWcHP';

    function getAuth() {
      return _auth;
    }

    function changeAuth(auth) {
      // console.log('auth in singleton', auth);
      _auth = auth;
    }

    function getNewToken(myApiOauth) {
      _token = _token
        ? myApiOauth.setTokens({ refresh_token: _token })
        : myApiOauth.openAuthWindowAndGetTokens().then((token) => {
            _token = token;

            // save the token.refresh_token secured to use it the next time the app loading
            // use your token.access_token
          });
    }

    function getToken() {
      return _token;
    }

    return {
      getAuth,
      changeAuth,
      getToken,
      getNewToken,
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = create();
      }
      return instance;
    },
  };
})();
