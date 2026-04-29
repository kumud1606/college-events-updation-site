import Notice from "../models/Notice.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/errors.js";

export const getNotices = asyncHandler(async (_request, response) => {
  const notices = await Notice.find().sort({ createdAt: -1 });

  response.json({
    notices: notices.map((notice) => ({
      id: String(notice._id),
      title: notice.title,
      message: notice.message,
      priority: notice.priority,
      audience: notice.audience,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt
    }))
  });
});

export const createNotice = asyncHandler(async (request, response) => {
  const { title, message, priority = "important", audience = "all" } = request.body;

  if (!title || !message) {
    throw badRequest("title and message are required.");
  }

  const notice = await Notice.create({
    title,
    message,
    priority,
    audience,
    createdBy: request.user._id
  });

  response.status(201).json({
    notice: {
      id: String(notice._id),
      title: notice.title,
      message: notice.message,
      priority: notice.priority,
      audience: notice.audience,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt
    }
  });
});

export const deleteNotice = asyncHandler(async (request, response) => {
  const notice = await Notice.findById(request.params.noticeId);

  if (!notice) {
    throw notFound("Notice not found.");
  }

  await notice.deleteOne();
  response.status(204).send();
});
