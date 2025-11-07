import { Router } from "express";

import { departamentoController } from "./controller";

const departamentoRouter = Router();

// Routes
departamentoRouter.get("/departamentos/select", departamentoController.getForSelect);
departamentoRouter.get("/departamentos/:id", departamentoController.getById);
departamentoRouter.get("/departamentos", departamentoController.getPaginated);
departamentoRouter.post("/departamentos", departamentoController.create);
departamentoRouter.put("/departamentos/:id", departamentoController.update);
departamentoRouter.delete("/departamentos/:id", departamentoController.delete);

export default departamentoRouter;
