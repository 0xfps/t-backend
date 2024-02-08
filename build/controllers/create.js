"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_addreses_1 = __importDefault(require("../db/schema/user-addreses"));
const create_wallet_1 = __importDefault(require("../utils/create-wallet"));
const encrypt_decrypt_1 = require("../utils/encrypt-decrypt");
/**
 * This controller creates a new Ethers JS wallet for an address.
 * The desired address is passed to the body of the JSON object
 * sent to the route.
 *
 * { address }
 *
 * Extra checks are added to ensure address is a valid EVM address.
 *
 * After the wallet is created successfully, it is added to the
 * database.
 *
 * @param req Request.
 * @param res Response.
 */
function createController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { address } = req.body;
        if (!address) {
            const response = {
                status: 400,
                msg: "No address specified."
            };
            res.send(response);
            return;
        }
        if (address.slice(0, 2) !== "0x") {
            const response = {
                status: 400,
                msg: "Invalid address."
            };
            res.send(response);
            return;
        }
        if (address.length != 42) {
            const response = {
                status: 400,
                msg: "Invalid address length."
            };
            res.send(response);
            return;
        }
        const databaseAddressData = yield user_addreses_1.default.findOne({ user: address });
        if (databaseAddressData) {
            const response = {
                status: 302,
                msg: "Address existent."
            };
            res.send(response);
            return;
        }
        const { privateKey, wallet } = (0, create_wallet_1.default)();
        const encryptedPrivateKey = (0, encrypt_decrypt_1.encryptPrivateKey)(privateKey);
        const createUser = yield user_addreses_1.default.create({
            user: address,
            tWallet: wallet,
            privateKey: encryptedPrivateKey,
            time_created: new Date().getTime()
        });
        if (!createUser) {
            const response = {
                status: 400,
                msg: "Account could't be created!"
            };
            res.send(response);
            return;
        }
        const response = {
            status: 201,
            msg: "Account created successfully!",
            data: {
                wallet_address: wallet
            }
        };
        res.send(response);
    });
}
exports.default = createController;
