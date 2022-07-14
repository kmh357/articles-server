"use strict";
const utils = require("@strapi/utils");
const { snitize } = utils;
const { ForbiddenError } = utils.errors;
/**
 *  comment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::comment.comment", ({ strapi }) => ({
  async create(ctx) {
    const { message } = JSON.parse(ctx.request.body);
    const id = ctx.state.user.id;
    const { articleId } = ctx.params;

    const article = await strapi.entityService.findOne(
      "api::article.article",
      articleId
    );
    if (!article) {
      ctx.throw(404);
    }
    const payload = {
      user: ctx.state.user.id,
      message,
      article: articleId,
    };

    console.log(payload);
    const entity = await strapi.entityService.create("api::comment.comment", {
      data: payload,
    });
    // const comment = await utils.sanitize.contentAPI.output(
    //   entity,
    //   strapi.getModel("api::comment.comment")
    // );
    return { comment: entity };
  },
  async find(ctx) {
    const entities = await strapi.entityService.findMany(
      "api::comment.comment",
      {
        filters: {
          $and: [
            {
              article: ctx.params.articleId,
            },
          ],
        },
        populate: "*",
      }
    );
    // return entities.map((entity) => {
    //   entity = utils.sanitize.contentAPI.output(
    //     entity,
    //     strapi.getModel("api::comment.comment")
    //   );
    // });
    return entities;
  },
  async update(ctx) {
    const { articleId, id } = ctx.params;

    const comment = await strapi.entityService.findOne(
      "api::comment.comment",
      id,
      {
        filters: {
          $and: [
            {
              article: articleId,
            },
          ],
        },
        populate: ["user"],
      }
    );

    if (!comment) {
      return ctx.throw(404);
    }

    if (ctx.request.body.article || ctx.request.body.user) {
      return ctx.thorw(400, "article or user field cannot be changed");
    }

    if (ctx.state.user.id !== comment.user.id) {
      return ctx.unauthorized("You can't update this entry");
    }
    const entity = await strapi.entityService.update(
      "api::comment.comment",
      id,
      { data: ctx.request.body }
    );

    return utils.sanitize.contentAPI.output(
      entity,
      strapi.getModel("api::comment.comment")
    );
  },
  async delete(ctx) {
    const { articleId, id } = ctx.params;
    const comment = await strapi.entityService.findOne(
      "api::comment.comment",
      id,
      {
        filters: {
          $and: [
            {
              article: articleId,
            },
          ],
        },
        populate: ["user"],
      }
    );

    if (!comment) {
      return ctx.throw(404);
    }

    if (ctx.state.user.id !== comment.user.id) {
      return ctx.unauthorized("You can't delete this entry");
    }
    const entity = await strapi.entityService.delete(
      "api::comment.comment",
      id
    );

    ctx.status = 204;
  },
}));
