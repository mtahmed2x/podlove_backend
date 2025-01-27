"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const authorization_1 = require("../middlewares/authorization");
const userServices_1 = __importDefault(require("../services/userServices"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileHandler_1 = __importDefault(require("../middlewares/fileHandler"));
const router = express_1.default.Router();
router.get("/get-all-users", userServices_1.default.getAllUsers);
router.get("/get-all-premium-users", userServices_1.default.getAllPremiumUsers);
router.get("/", authorization_1.authorize, userController_1.default.get);
router.put("/update", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, userController_1.default.update);
router.post("/block/:authId", userServices_1.default.block);
router.post("/unblock/:authId", userServices_1.default.unblock);
exports.default = router;
