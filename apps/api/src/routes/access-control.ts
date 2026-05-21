import { Router } from "express";
import { accessControlService, AdminError } from "@repo/services/admin";
import { csrfProtection } from "../middleware/csrf";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middleware/auth";
import { loadActorFromAuth } from "../lib/actor";

const accessControlRouter = Router();

accessControlRouter.use(requireAuth, requireAdmin);

function handleError(err: unknown, res: import("express").Response) {
  if (err instanceof AdminError) {
    res.status(err.statusCode).json({ detail: err.message });
    return;
  }
  throw err;
}

accessControlRouter.get("/access-control/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const data = await accessControlService.list(actor);
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
});

accessControlRouter.post(
  "/access-control/:roleId/toggle_page/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      await accessControlService.togglePage(
        actor,
        Number(req.params.roleId),
        req.body.page_slug,
      );
      res.json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  },
);

accessControlRouter.post(
  "/access-control/:roleId/toggle_component/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      await accessControlService.toggleComponent(
        actor,
        Number(req.params.roleId),
        req.body.component_slug,
      );
      res.json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  },
);

accessControlRouter.post(
  "/access-control/:roleId/select_all_page/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      await accessControlService.setAllPageComponents(
        actor,
        Number(req.params.roleId),
        req.body.page_slug,
        true,
      );
      res.json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  },
);

accessControlRouter.post(
  "/access-control/:roleId/select_none_page/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      await accessControlService.setAllPageComponents(
        actor,
        Number(req.params.roleId),
        req.body.page_slug,
        false,
      );
      res.json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  },
);

export { accessControlRouter };
