"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionPlanController_1 = __importDefault(require("@controllers/subscriptionPlanController"));
const router = express_1.default.Router();
router.post("/create", subscriptionPlanController_1.default.create);
router.get("/", subscriptionPlanController_1.default.getAll);
router.get("/:id", subscriptionPlanController_1.default.get);
router.put("/update/:id", subscriptionPlanController_1.default.update);
exports.default = router;
