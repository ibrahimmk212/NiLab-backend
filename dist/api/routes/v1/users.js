"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = __importDefault(require("../../controllers/UserController"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validator_1 = require("../../middlewares/validator");
const constants_1 = require("../../../constants");
const usersRouter = (0, express_1.Router)();
usersRouter
    .route('/')
    .post(auth_1.default.authenticate, (0, validator_1.Validate)(validator_1.Requirements.createUsers), auth_1.default.checkRoles(constants_1.ROLE.ADMIN), UserController_1.default.createUser)
    .get(auth_1.default.authenticate, auth_1.default.checkRoles(constants_1.ROLE.ADMIN), UserController_1.default.getUsers);
usersRouter.route('/me').get(auth_1.default.authenticate, UserController_1.default.currentUser);
usersRouter
    .route('/:id')
    .get(auth_1.default.authenticate, (0, validator_1.Validate)(validator_1.Requirements.getUserDetail), auth_1.default.checkRoles(constants_1.ROLE.ADMIN), UserController_1.default.getUserDetail)
    .put(auth_1.default.authenticate, (0, validator_1.Validate)(validator_1.Requirements.updateUser), auth_1.default.checkRoles(constants_1.ROLE.ADMIN), UserController_1.default.updateUser)
    .delete(auth_1.default.authenticate, (0, validator_1.Validate)(validator_1.Requirements.deleteUser), auth_1.default.checkRoles(constants_1.ROLE.ADMIN), UserController_1.default.deleteUser);
exports.default = usersRouter;
