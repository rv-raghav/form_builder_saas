import { Router } from "express";
import { formsService, formResponsesService, FormsError } from "@repo/services/forms";
import { csrfProtection } from "../middleware/csrf";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { loadActorFromAuth } from "../lib/actor";

const formsRouter = Router();

formsRouter.use(requireAuth);

function handleError(err: unknown, res: import("express").Response) {
  if (err instanceof FormsError) {
    const { fieldErrors, code } = err.options ?? {};
    res.status(err.statusCode).json({
      detail: err.message,
      ...(code ? { code } : {}),
      ...(fieldErrors ?? {}),
    });
    return;
  }
  throw err;
}

formsRouter.get("/forms/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const result = await formsService.list(actor, {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      page_size: req.query.page_size ? Number(req.query.page_size) : undefined,
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.post("/forms/", csrfProtection, async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const form = await formsService.create(actor, req.body);
    res.status(201).json(form);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.get("/forms/:formId/analytics/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const summary = await formResponsesService.analytics(actor, req.params.formId);
    res.json(summary);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.get("/forms/:formId/responses/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const result = await formResponsesService.list(actor, req.params.formId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      page_size: req.query.page_size ? Number(req.query.page_size) : undefined,
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.get("/forms/:formId/responses/:responseId/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const detail = await formResponsesService.get(
      actor,
      req.params.formId,
      req.params.responseId,
    );
    res.json(detail);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.get("/forms/:id/", async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const form = await formsService.get(actor, req.params.id);
    res.json(form);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.patch("/forms/:id/", csrfProtection, async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    const form = await formsService.update(actor, req.params.id, req.body);
    res.json(form);
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.delete("/forms/:id/", csrfProtection, async (req: AuthedRequest, res) => {
  try {
    const actor = await loadActorFromAuth(req.user!);
    await formsService.delete(actor, req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

formsRouter.post(
  "/forms/:id/publish/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const form = await formsService.publish(actor, req.params.id);
      res.json(form);
    } catch (err) {
      handleError(err, res);
    }
  },
);

formsRouter.post(
  "/forms/:id/unpublish/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const form = await formsService.unpublish(actor, req.params.id);
      res.json(form);
    } catch (err) {
      handleError(err, res);
    }
  },
);

formsRouter.post(
  "/forms/:id/duplicate/",
  csrfProtection,
  async (req: AuthedRequest, res) => {
    try {
      const actor = await loadActorFromAuth(req.user!);
      const form = await formsService.duplicate(actor, req.params.id);
      res.status(201).json(form);
    } catch (err) {
      handleError(err, res);
    }
  },
);

export { formsRouter };
