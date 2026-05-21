import { Router } from "express";
import {
  adminUsersService,
  userOverridesService,
  AdminError,
} from "@repo/services/admin";
import { csrfProtection } from "../middleware/csrf";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middleware/auth";
import { loadActorFromAuth } from "../lib/actor";

const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

function handleError(err: unknown, res: import("express").Response) {
  if (err instanceof AdminError) {
    const body: Record<string, unknown> = { detail: err.message };
    if (err.statusCode === 400) {
      body[err.message.split(":")[0] ?? "error"] = [err.message];
    }
    res.status(err.statusCode).json(body);
    return;
  }
  throw err;
}

usersRouter.get("/roles/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const roles = await adminUsersService.listRolesForActor(actor);
    res.json(roles);
  } catch (err) {
    handleError(err, res);
  }
});

usersRouter.get("/users/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const result = await adminUsersService.listUsers(
      actor,
      req.query as Record<string, unknown>,
    );
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

usersRouter.post("/users/", csrfProtection, async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const user = await adminUsersService.createUser(actor, req.body);
    res.status(201).json(user);
  } catch (err) {
    handleError(err, res);
  }
});

usersRouter.get("/users/:id/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const user = await adminUsersService.getUser(actor, req.params.id);
    res.json(user);
  } catch (err) {
    handleError(err, res);
  }
});

usersRouter.patch("/users/:id/", csrfProtection, async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const user = await adminUsersService.updateUser(
      actor,
      req.params.id,
      req.body,
    );
    res.json(user);
  } catch (err) {
    handleError(err, res);
  }
});

usersRouter.delete("/users/:id/", csrfProtection, async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    await adminUsersService.deleteUser(actor, req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

usersRouter.post(
  "/users/:id/activate/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const result = await adminUsersService.setActive(
        actor,
        req.params.id,
        true,
      );
      res.json(result);
    } catch (err) {
      handleError(err, res);
    }
  },
);

usersRouter.post(
  "/users/:id/deactivate/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const result = await adminUsersService.setActive(
        actor,
        req.params.id,
        false,
      );
      res.json(result);
    } catch (err) {
      handleError(err, res);
    }
  },
);

usersRouter.get(
  "/users/:id/effective-permissions/",
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const data = await userOverridesService.getEffective(
        actor,
        req.params.id,
      );
      res.json(data);
    } catch (err) {
      handleError(err, res);
    }
  },
);

usersRouter.post(
  "/users/:id/permission-overrides/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      await userOverridesService.upsertOverride(actor, req.params.id, req.body);
      res.status(201).json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  },
);

usersRouter.delete(
  "/users/:id/permission-overrides/by-slug/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const type = req.query.type as "page" | "component";
      const slug = req.query.slug as string;
      await userOverridesService.deleteBySlug(actor, req.params.id, type, slug);
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  },
);

usersRouter.post(
  "/users/:id/permission-overrides/clear/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      await userOverridesService.clearAll(actor, req.params.id);
      res.json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  },
);

export { usersRouter };
