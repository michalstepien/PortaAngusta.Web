import express from "express";
import fs from "fs";
import path from "path";
const fsPromises = fs.promises;

import { BaseController, BaseControllerOf } from "../controllers/base";

const router = express.Router();

async function createController() {
    const directoryPath = "./app/controllers";
    const files = await fsPromises.readdir(directoryPath);

    files.forEach(async (file) => {
        if (file !== "base.ts") {
            const model = await import("../controllers/" + file.replace(".ts", ""));
            const keys = Object.keys(model);
            keys.forEach((k) => {
                if (Object.getPrototypeOf(model[k]) === BaseController ||
                Object.getPrototypeOf(model[k]) === BaseControllerOf) {
                    const instance: BaseController = new model[k]();
                    instance.generateRoutes(router);
                }
            });
        }
    });
    return router;
}

// router.get("/", (req, res) => {
//     // const usr: User = new User();
//     // usr.id = "5:0";
//     // usr.load().then((a: User) => {
//     //     console.log(a);
//     // });
//     // res.send("Hello World!");
// }
// );
// router.use("/users", require("./users"));

export default createController;
