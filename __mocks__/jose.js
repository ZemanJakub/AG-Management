module.exports = {
    SignJWT: function () {
      return {
        setProtectedHeader: function () {
          return this;
        },
        setIssuedAt: function () {
          return this;
        },
        setExpirationTime: function () {
          return this;
        },
        sign: async function () {
          return 'mocked_token';
        },
      };
    },
    jwtVerify: async function () {
      return { payload: {} };
    },
  };
  