
const OK = (obj) => ({
   obj: obj,
   code: 200
});

const CREATED = (obj) => ({
   obj: obj,
   code: 201
});

const NO_CONTENT = () => ({
   code: 204
});

const BAD_REQUEST = (message) => ({
   error: `Bad request${message ? ` - ${message}` : " error"}`,
   code: 400
});

const UNAUTHORIZED = (message) => ({
   error: `Unauthorized${message ? ` - ${message}` : " error"}`,
   code: 401
});

const NOT_FOUND = (message) => ({
   error: `Not Found${message ? ` - ${message}` : " error"}`,
   code: 404
});

const CONFLICT = (message) => ({
   error: `Conflict${message ? ` - ${message}` : " error"}`,
   code: 409
});

const UNPROCESSABLE_ENTITY = (message) => ({
   error: `Unprocessable Entity${message ? ` - ${message}` : " error"}`,
   code: 422
});

const INTERNAL_SERVER_ERROR = (message) => ({
   error: `Internal Server Error${message ? ` - ${message}` : " error"}`,
   code: 500
});

const SERVICE_UNAVAILABLE = (message) => ({
   error: `Service Unavailable${message ? ` - ${message}` : " error"}`,
   code: 503
});

module.exports = {
   OK,
   CREATED,
   NO_CONTENT,
   BAD_REQUEST,
   UNAUTHORIZED,
   NOT_FOUND,
   CONFLICT,
   UNPROCESSABLE_ENTITY,
   INTERNAL_SERVER_ERROR,
   SERVICE_UNAVAILABLE
}