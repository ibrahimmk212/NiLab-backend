"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const appConfig_1 = __importDefault(require("../../config/appConfig"));
const apiVersion = appConfig_1.default.app.apiVersion;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation with swagger',
            termsOfService: 'http://example.com/terms/',
            contact: {
                name: 'API Support',
                url: 'http://www.example.com/support',
                email: 'support@example.com'
            },
            license: {
                name: 'Apache 2.0',
                url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
            }
        },
        servers: [
            {
                url: `/api/${apiVersion}`,
                description: `Server ${appConfig_1.default.app.server}`
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            responses: {
                '200': {
                    description: 'OK',
                    content: {
                        'application/json': {}
                    }
                },
                '400': {
                    description: 'Bad Request'
                },
                '401': {
                    description: 'Unauthorized'
                },
                '403': {
                    descriptipn: 'Forbidden'
                },
                '422': {
                    description: 'Unprocessable entity'
                }
            }
        }
    },
    apis: [`./docs/${apiVersion}/*.yaml`]
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
